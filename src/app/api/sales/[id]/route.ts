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
    const sale = await prisma.dailySale.findUnique({
      where: { id },
      include: { inventoryItem: true, priceHistory: true },
    })
    if (!sale) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(sale)
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
    const existing = await prisma.dailySale.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.dailySale.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
