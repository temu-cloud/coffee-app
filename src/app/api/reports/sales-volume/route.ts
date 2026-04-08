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

  const fromDate = from ? new Date(from) : new Date(0)
  const toDate = to ? new Date(to) : new Date()

  try {
    const sales = await prisma.dailySale.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      orderBy: { date: 'asc' },
    })

    const data = sales.map((sale) => ({
      inventoryItemId: sale.inventoryItemId ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemName: (sale as any).itemName ?? '—',
      date: sale.date.toISOString().slice(0, 10),
      quantitySold: sale.quantitySold.toString(),
    }))

    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
