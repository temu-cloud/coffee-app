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
    const { itemName, unitPrice, quantitySold, date, inventoryItemId, priceHistoryId } = body

    if (!itemName || unitPrice == null || quantitySold == null || !date) {
      return Response.json(
        { error: 'itemName, unitPrice, quantitySold, and date are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantitySold)
    const price = Number(unitPrice)

    if (qty <= 0) return Response.json({ error: 'quantitySold must be > 0' }, { status: 400 })
    if (price <= 0) return Response.json({ error: 'unitPrice must be > 0' }, { status: 400 })

    const sale = await prisma.dailySale.create({
      data: {
        date: new Date(date),
        itemName,
        unitPrice: price,
        quantitySold: qty,
        saleTotal: qty * price,
        inventoryItemId: inventoryItemId ?? null,
        priceHistoryId: priceHistoryId ?? null,
        createdById: session!.user.id,
      },
    })

    return Response.json(sale, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
