import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(_request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  try {
    const items = await prisma.inventoryItem.findMany({
      where: { category: 'INGREDIENT', deletedAt: null },
      select: { name: true, unitCost: true },
      orderBy: { name: 'asc' },
    })

    const data = items.map((item) => ({
      name: item.name,
      unitCost: item.unitCost.toString(),
    }))

    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
