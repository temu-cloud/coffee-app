import { requireSession } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

const LOW_STOCK_THRESHOLD = 10

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const sevenDaysAgo = new Date(todayStart)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const [
      allInventoryItems,
      last7DaysSales,
      todaySalesAgg,
      todayExpensesAgg,
      todayPaymentsAgg,
      pendingPaymentsAgg,
    ] = await Promise.all([
      // All active inventory items (ingredients) for low-stock calculation
      prisma.inventoryItem.findMany({
        where: { deletedAt: null, category: 'INGREDIENT' },
        select: { id: true, name: true, quantity: true },
      }),
      // Daily sales for the past 7 days for usage chart
      prisma.dailySale.findMany({
        where: { date: { gte: sevenDaysAgo } },
        select: { quantitySold: true, date: true },
      }),
      prisma.dailySale.aggregate({
        where: { date: { gte: todayStart, lt: todayEnd } },
        _sum: { saleTotal: true },
      }),
      prisma.dailyExpense.aggregate({
        where: { date: { gte: todayStart, lt: todayEnd } },
        _sum: { totalPrice: true },
      }),
      prisma.payment.aggregate({
        where: { date: { gte: todayStart, lt: todayEnd }, executedAt: { not: null } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { executedAt: null },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    // Aggregate quantity per ingredient name (multiple entries can exist for same ingredient)
    const stockByName: Record<string, { id: string; name: string; stock: number }> = {}
    for (const item of allInventoryItems) {
      if (!stockByName[item.name]) {
        stockByName[item.name] = { id: item.id, name: item.name, stock: 0 }
      }
      stockByName[item.name].stock += Number(item.quantity)
    }

    const allAggregated = Object.values(stockByName)
    const lowStockProducts = allAggregated
      .filter((p) => p.stock < LOW_STOCK_THRESHOLD)
      .map((p) => ({ ...p, lowStockThreshold: LOW_STOCK_THRESHOLD }))

    // Build daily usage chart from sales for past 7 days
    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      dailyMap[d.toISOString().slice(0, 10)] = 0
    }
    for (const sale of last7DaysSales) {
      const key = new Date(sale.date).toISOString().slice(0, 10)
      if (key in dailyMap) dailyMap[key] += Number(sale.quantitySold)
    }
    const dailyUsage = Object.entries(dailyMap).map(([date, quantity]) => ({ date, quantity }))

    const todayRevenue = Number(todaySalesAgg._sum.saleTotal ?? 0)
    const todayCosts =
      Number(todayExpensesAgg._sum.totalPrice ?? 0) + Number(todayPaymentsAgg._sum.amount ?? 0)
    const todayProfit = todayRevenue - todayCosts

    return Response.json({
      totalProducts: allAggregated.length,
      lowStockCount: lowStockProducts.length,
      todayStockOut: 0,
      todayStockIn: 0,
      lowStockProducts,
      dailyUsage,
      todayRevenue: todayRevenue.toFixed(2),
      todayCosts: todayCosts.toFixed(2),
      todayProfit: todayProfit.toFixed(2),
      pendingPaymentsCount: pendingPaymentsAgg._count.id,
      pendingPaymentsTotal: Number(pendingPaymentsAgg._sum.amount ?? 0).toFixed(2),
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
