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
    const budget = await prisma.budget.findUnique({ where: { id } })
    if (!budget) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(budget)
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
    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { category, allocatedAmount } = body

    const updateData: Record<string, unknown> = { updatedById: session!.user.id }

    if (category !== undefined) {
      updateData.category = category
    }

    if (allocatedAmount !== undefined) {
      const amt = Number(allocatedAmount)
      if (amt <= 0) {
        return Response.json({ error: 'allocatedAmount must be greater than 0' }, { status: 400 })
      }
      updateData.allocatedAmount = amt
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    })

    return Response.json(budget)
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.budget.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
