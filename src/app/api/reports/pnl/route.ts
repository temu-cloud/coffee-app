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
    const [sales, expenses, payments, inventoryItems, supplies, assets] = await Promise.all([
      prisma.dailySale.findMany({ where: { date: { gte: fromDate, lte: toDate } } }),
      prisma.dailyExpense.findMany({ where: { date: { gte: fromDate, lte: toDate } } }),
      prisma.payment.findMany({
        where: { date: { gte: fromDate, lte: toDate }, executedAt: { not: null } },
      }),
      // Inventory purchase cost (when items were added)
      prisma.inventoryItem.findMany({
        where: { deletedAt: null, date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalCost: true },
      }),
      prisma.supplyItem.findMany({
        where: { date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalCost: true },
      }),
      prisma.asset.findMany({
        where: { acquisitionDate: { gte: fromDate, lte: toDate } },
        select: { acquisitionDate: true, totalCost: true },
      }),
    ])

    const dailyMap: Record<string, { revenue: number; costs: number }> = {}
    const getKey = (d: Date) => d.toISOString().slice(0, 10)

    for (const sale of sales) {
      const key = getKey(sale.date)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].revenue += Number(sale.saleTotal)
    }
    for (const expense of expenses) {
      const key = getKey(expense.date)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].costs += Number(expense.totalPrice)
    }
    for (const payment of payments) {
      const key = getKey(payment.date)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].costs += Number(payment.amount)
    }
    for (const item of inventoryItems) {
      const key = getKey(item.date)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].costs += Number(item.totalCost)
    }
    for (const supply of supplies) {
      const key = getKey(supply.date)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].costs += Number(supply.totalCost)
    }
    for (const asset of assets) {
      const key = getKey(asset.acquisitionDate)
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, costs: 0 }
      dailyMap[key].costs += Number(asset.totalCost)
    }

    let totalRevenue = 0
    let totalCosts = 0

    const dailyBreakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { revenue, costs }]) => {
        totalRevenue += revenue
        totalCosts += costs
        return {
          date,
          revenue: revenue.toFixed(2),
          costs: costs.toFixed(2),
          profit: (revenue - costs).toFixed(2),
        }
      })

    return Response.json({
      totalRevenue: totalRevenue.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      totalProfit: (totalRevenue - totalCosts).toFixed(2),
      dailyBreakdown,
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
