import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const executedParam = searchParams.get('executed')
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
    if (executedParam !== null) {
      const isExecuted = executedParam === 'true'
      where.executedAt = isExecuted ? { not: null } : null
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.payment.count({ where }),
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  try {
    const body = await request.json()
    const { date, payee, description, amount, paymentMethod } = body

    if (!date || !payee || !description || amount == null || !paymentMethod) {
      return Response.json(
        { error: 'date, payee, description, amount, and paymentMethod are required' },
        { status: 400 }
      )
    }

    const amt = Number(amount)
    if (amt <= 0) {
      return Response.json({ error: 'amount must be greater than 0' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        date: new Date(date),
        payee,
        description,
        amount: amt,
        paymentMethod,
        createdById: session!.user.id,
      },
    })

    return Response.json(payment, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
