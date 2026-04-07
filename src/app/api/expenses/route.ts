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
      prisma.dailyExpense.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.dailyExpense.count({ where }),
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
    const { date, itemName, quantity, unitPrice } = body

    if (!date || !itemName || quantity == null || unitPrice == null) {
      return Response.json(
        { error: 'date, itemName, quantity, and unitPrice are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    const price = Number(unitPrice)

    if (qty <= 0) {
      return Response.json({ error: 'quantity must be greater than 0' }, { status: 400 })
    }
    if (price <= 0) {
      return Response.json({ error: 'unitPrice must be greater than 0' }, { status: 400 })
    }

    const totalPrice = qty * price

    const expense = await prisma.dailyExpense.create({
      data: {
        date: new Date(date),
        itemName,
        quantity: qty,
        unitPrice: price,
        totalPrice,
        createdById: session!.user.id,
      },
    })

    return Response.json(expense, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
