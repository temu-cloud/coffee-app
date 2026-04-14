import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'
import { deductFromStock, RECIPE_DEDUCTIONS } from '@/lib/stockMovement'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const where: Record<string, unknown> = {}
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      }
    }

    const [data, total] = await Promise.all([
      prisma.dailySale.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.dailySale.count({ where }),
    ])

    return Response.json({ data, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  try {
    const body = await request.json()
    const { itemName, unitPrice, quantitySold, date, inventoryItemId, priceHistoryId, unitCost } = body

    if (!itemName || unitPrice == null || quantitySold == null || !date) {
      return Response.json(
        { error: 'itemName, unitPrice, quantitySold, and date are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantitySold)
    const price = Number(unitPrice)
    const cost = unitCost != null ? Number(unitCost) : 0

    if (qty <= 0) return Response.json({ error: 'quantitySold must be > 0' }, { status: 400 })
    if (price <= 0) return Response.json({ error: 'unitPrice must be > 0' }, { status: 400 })

    // ── Stock availability check ──────────────────────────────────────────
    const recipeKey = itemName.toLowerCase()
    const deductions = RECIPE_DEDUCTIONS[recipeKey]

    if (deductions) {
      // Recipe: check each ingredient has enough remaining stock
      for (const [ingredient, perUnit] of deductions) {
        const needed = perUnit * qty
        const stock = await prisma.stockMovement.findUnique({ where: { itemName: ingredient } })
        const remaining = stock ? Number(stock.quantityRemaining) : 0
        if (remaining < needed) {
          return Response.json(
            { error: `Insufficient stock for ingredient "${ingredient}". Available: ${remaining.toFixed(3)}, needed: ${needed.toFixed(3)}` },
            { status: 422 }
          )
        }
      }
    } else {
      // Finished good: check item stock directly
      const stock = await prisma.stockMovement.findUnique({ where: { itemName: itemName.toLowerCase() } })
      const remaining = stock ? Number(stock.quantityRemaining) : 0
      if (remaining < qty) {
        return Response.json(
          { error: `Insufficient stock for "${itemName}". Available: ${remaining.toFixed(3)}, needed: ${qty}` },
          { status: 422 }
        )
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    const saleTotal = qty * price
    const totalCost = cost * qty
    const profit = saleTotal - totalCost

    const sale = await prisma.dailySale.create({
      data: {
        date: new Date(date),
        itemName,
        unitPrice: price,
        unitCost: cost,
        quantitySold: qty,
        saleTotal,
        totalCost,
        profit,
        inventoryItemId: inventoryItemId ?? null,
        priceHistoryId: priceHistoryId ?? null,
        createdById: session!.user.id,
      },
    })

    // Update stock movement
    const recipeKey2 = itemName.toLowerCase()
    const deductions2 = RECIPE_DEDUCTIONS[recipeKey2]
    if (deductions2) {
      for (const [ingredient, perUnit] of deductions2) {
        await deductFromStock(prisma, ingredient, perUnit * qty)
      }
    } else {
      await deductFromStock(prisma, itemName, qty)
    }

    return Response.json(sale, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
