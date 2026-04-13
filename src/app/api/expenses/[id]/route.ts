import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const expense = await prisma.dailyExpense.findUnique({ where: { id } })
    if (!expense) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(expense)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.dailyExpense.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.dailyExpense.delete({ where: { id } })
    return new Response(null, { status: 204 })
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.dailyExpense.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const { date, itemName, quantity, unitPrice } = body

    if (!date || !itemName || quantity == null || unitPrice == null) {
      return Response.json({ error: 'date, itemName, quantity, and unitPrice are required' }, { status: 400 })
    }

    const qty = Number(quantity)
    const price = Number(unitPrice)
    if (qty <= 0) return Response.json({ error: 'quantity must be > 0' }, { status: 400 })
    if (price <= 0) return Response.json({ error: 'unitPrice must be > 0' }, { status: 400 })

    const expense = await prisma.dailyExpense.update({
      where: { id },
      data: {
        date: new Date(date),
        itemName: itemName.trim(),
        quantity: qty,
        unitPrice: price,
        totalPrice: qty * price,
        updatedById: session!.user.id,
      },
    })

    return Response.json(expense)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
