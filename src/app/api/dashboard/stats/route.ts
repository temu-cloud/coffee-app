import { requireSession } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

const LOW_STOCK_THRESHOLD = 5

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
      lowStockMovements,
      allStockMovements,
      last7DaysSales,
      todaySalesAgg,
      todayExpensesAgg,
      todayPaymentsAgg,
      todayInventoryCostAgg,
      todaySupplyCostAgg,
      pendingPaymentsAgg,
    ] = await Promise.all([
      // Low stock: items with remaining < threshold from StockMovement
      prisma.stockMovement.findMany({
        where: { quantityRemaining: { lt: LOW_STOCK_THRESHOLD } },
        orderBy: { quantityRemaining: 'asc' },
      }),
      prisma.stockMovement.count(),
      prisma.dailySale.findMany({
        where: { date: { gte: sevenDaysAgo, lt: todayEnd } },
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
      prisma.inventoryItem.aggregate({
        where: { deletedAt: null, date: { gte: todayStart, lt: todayEnd } },
        _sum: { totalCost: true },
      }),
      prisma.supplyItem.aggregate({
        where: { date: { gte: todayStart, lt: todayEnd } },
        _sum: { totalCost: true },
      }),
      prisma.payment.aggregate({
        where: { executedAt: null },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    // Map low stock movements to the shape LowStockTable expects
    const lowStockProducts = lowStockMovements.map((sm) => ({
      id: sm.id,
      name: sm.itemName,
      stock: Number(sm.quantityRemaining),
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    }))

    // 7-day usage chart from sales — use local date strings to avoid timezone mismatch
    const dailyMap: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - (6 - i))
      // Format as YYYY-MM-DD in local time
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      dailyMap[`${y}-${m}-${day}`] = 0
    }
    for (const sale of last7DaysSales) {
      // Convert stored UTC date to local date string
      const localDate = new Date(sale.date)
      const y = localDate.getFullYear()
      const m = String(localDate.getMonth() + 1).padStart(2, '0')
      const day = String(localDate.getDate()).padStart(2, '0')
      const key = `${y}-${m}-${day}`
      if (key in dailyMap) dailyMap[key] += Number(sale.quantitySold)
    }
    const dailyUsage = Object.entries(dailyMap).map(([date, quantity]) => ({ date, quantity }))

    const todayRevenue = Number(todaySalesAgg._sum.saleTotal ?? 0)
    const todayCosts =
      Number(todayExpensesAgg._sum.totalPrice ?? 0) +
      Number(todayPaymentsAgg._sum.amount ?? 0) +
      Number(todayInventoryCostAgg._sum.totalCost ?? 0) +
      Number(todaySupplyCostAgg._sum.totalCost ?? 0)
    const todayProfit = todayRevenue - todayCosts

    return Response.json({
      totalProducts: allStockMovements,
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
