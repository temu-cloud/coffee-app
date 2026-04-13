import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'
import { ItemCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const where = {
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(category ? { category: category as ItemCategory } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ date: 'desc' }, { name: 'asc' }],
      }),
      prisma.inventoryItem.count({ where }),
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  try {
    const body = await request.json()
    const { category, date, name, units, quantity, unitCost, supplier } = body

    if (!category || !date || !name || !units || quantity == null || unitCost == null || !supplier) {
      return Response.json(
        { error: 'category, date, name, units, quantity, unitCost, and supplier are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    const cost = Number(unitCost)

    if (qty <= 0) return Response.json({ error: 'quantity must be greater than 0' }, { status: 400 })
    if (cost <= 0) return Response.json({ error: 'unitCost must be greater than 0' }, { status: 400 })

    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.inventoryItem.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          category: category as ItemCategory,
          deletedAt: null,
        },
      })

      if (existing) {
        // Upsert: merge into existing record
        const newQty = Number(existing.quantity) + qty
        const newTotal = Number(existing.totalCost) + qty * cost
        const newUnitCost = newTotal / newQty

        const updated = await tx.inventoryItem.update({
          where: { id: existing.id },
          data: {
            quantity: newQty,
            unitCost: newUnitCost,
            totalCost: newTotal,
            updatedById: session!.user.id,
            updatedAt: new Date(),
          },
        })

        await tx.inventoryHistory.create({
          data: {
            inventoryItemId: existing.id,
            date: new Date(date),
            quantityAdded: qty,
            unitCost: cost,
            totalCost: qty * cost,
            supplier,
            createdById: session!.user.id,
          },
        })

        return updated
      } else {
        // Create new record
        const created = await tx.inventoryItem.create({
          data: {
            category: category as ItemCategory,
            date: new Date(date),
            name,
            units,
            quantity: qty,
            unitCost: cost,
            totalCost: qty * cost,
            supplier,
            createdById: session!.user.id,
          },
        })

        await tx.inventoryHistory.create({
          data: {
            inventoryItemId: created.id,
            date: new Date(date),
            quantityAdded: qty,
            unitCost: cost,
            totalCost: qty * cost,
            supplier,
            createdById: session!.user.id,
          },
        })

        return created
      }
    })

    return Response.json(item, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
