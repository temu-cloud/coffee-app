import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const item = await prisma.inventoryItem.findFirst({
      where: { id },
    })
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 })

    const history = await prisma.inventoryHistory.findMany({
      where: { inventoryItemId: id },
      orderBy: { date: 'desc' },
    })

    return Response.json(history)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
