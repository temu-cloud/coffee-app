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
    const [expenses, supplies] = await Promise.all([
      prisma.dailyExpense.findMany({ where: { date: { gte: fromDate, lte: toDate } } }),
      prisma.supplyItem.findMany({ where: { date: { gte: fromDate, lte: toDate } } }),
    ])

    // Group expenses by itemName
    const costMap: Record<string, number> = {}

    for (const expense of expenses) {
      const key = expense.itemName
      costMap[key] = (costMap[key] ?? 0) + Number(expense.totalPrice)
    }

    // Group supplies by name
    for (const supply of supplies) {
      const key = supply.name
      costMap[key] = (costMap[key] ?? 0) + Number(supply.totalCost)
    }

    const data = Object.entries(costMap).map(([category, totalCost]) => ({
      category,
      totalCost: totalCost.toFixed(2),
    }))

    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
