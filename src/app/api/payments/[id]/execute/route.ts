import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function POST(
  _request: NextRequest,
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
      return Response.json({ error: 'Payment has already been executed' }, { status: 409 })
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        executedAt: new Date(),
        executedById: session!.user.id,
      },
    })

    return Response.json(payment)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
