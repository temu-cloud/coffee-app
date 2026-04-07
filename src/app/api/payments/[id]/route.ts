import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(payment)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.payment.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    if (existing.executedAt !== null) {
      return Response.json({ error: 'Cannot update an already executed payment' }, { status: 409 })
    }

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

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        date: new Date(date),
        payee,
        description,
        amount: amt,
        paymentMethod,
      },
    })

    return Response.json(payment)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
