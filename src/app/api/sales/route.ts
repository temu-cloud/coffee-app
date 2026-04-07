import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const inventoryItemId = searchParams.get('inventoryItemId')
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
    if (inventoryItemId) {
      where.inventoryItemId = inventoryItemId
    }

    const [data, total] = await Promise.all([
      prisma.dailySale.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
        include: { inventoryItem: true, priceHistory: true },
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
    const { inventoryItemId, quantitySold, date } = body

    if (!inventoryItemId || quantitySold == null || !date) {
      return Response.json(
        { error: 'inventoryItemId, quantitySold, and date are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantitySold)
    if (qty <= 0) {
      return Response.json({ error: 'quantitySold must be greater than 0' }, { status: 400 })
    }

    const saleDate = new Date(date)

    const sale = await prisma.$transaction(async (tx) => {
      // a. Fetch InventoryItem
      const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } })
      if (!item || item.deletedAt !== null) {
        throw { status: 404, error: 'Inventory item not found' }
      }

      // b. Check stock
      if (Number(item.quantity) < qty) {
        throw { status: 422, error: 'Insufficient stock', available: item.quantity }
      }

      // c. Fetch latest applicable price
      const priceHistory = await tx.priceHistory.findFirst({
        where: { inventoryItemId, effectiveDate: { lte: saleDate } },
        orderBy: { effectiveDate: 'desc' },
      })
      if (!priceHistory) {
        throw { status: 422, error: 'No price found for this item on the given date' }
      }

      // d. Compute saleTotal
      const saleTotal = qty * Number(priceHistory.price)

      // e. Create DailySale
      const created = await tx.dailySale.create({
        data: {
          date: saleDate,
          inventoryItemId,
          priceHistoryId: priceHistory.id,
          quantitySold: qty,
          saleTotal,
          createdById: session!.user.id,
        },
      })

      // f. Decrement inventory
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: { decrement: qty } },
      })

      return created
    })

    return Response.json(sale, { status: 201 })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'status' in e) {
      const err = e as { status: number; error: string; available?: unknown }
      if (err.status === 404) {
        return Response.json({ error: err.error }, { status: 404 })
      }
      if (err.status === 422) {
        return Response.json(
          { error: err.error, ...(err.available !== undefined ? { available: err.available } : {}) },
          { status: 422 }
        )
      }
    }
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
