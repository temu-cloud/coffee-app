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
    const [ingredients, finishedGoods, assets, supplies, expenses, payments] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { category: 'INGREDIENT', deletedAt: null, date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalCost: true },
      }),
      prisma.inventoryItem.findMany({
        where: { category: 'FINISHED_GOOD', deletedAt: null, date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalCost: true },
      }),
      prisma.asset.findMany({
        where: { acquisitionDate: { gte: fromDate, lte: toDate } },
        select: { acquisitionDate: true, totalCost: true },
      }),
      prisma.supplyItem.findMany({
        where: { date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalCost: true },
      }),
      prisma.dailyExpense.findMany({
        where: { date: { gte: fromDate, lte: toDate } },
        select: { date: true, totalPrice: true },
      }),
      prisma.payment.findMany({
        where: { date: { gte: fromDate, lte: toDate }, executedAt: { not: null } },
        select: { date: true, amount: true },
      }),
    ])

    // Build date → category → total map
    type DayMap = Record<string, Record<string, number>>
    const dayMap: DayMap = {}
    const getKey = (d: Date) => d.toISOString().slice(0, 10)

    const add = (date: Date, category: string, cost: number) => {
      const key = getKey(date)
      if (!dayMap[key]) dayMap[key] = {}
      dayMap[key][category] = (dayMap[key][category] ?? 0) + cost
    }

    for (const r of ingredients) add(r.date, 'Ingredients', Number(r.totalCost))
    for (const r of finishedGoods) add(r.date, 'Finished Goods', Number(r.totalCost))
    for (const r of assets) add(r.acquisitionDate, 'Assets', Number(r.totalCost))
    for (const r of supplies) add(r.date, 'Supplies', Number(r.totalCost))
    for (const r of expenses) add(r.date, 'Expenses', Number(r.totalPrice))
    for (const r of payments) add(r.date, 'Payments', Number(r.amount))

    // Also return aggregated totals for the table (backward-compatible)
    const totals: Record<string, number> = {}
    for (const cats of Object.values(dayMap)) {
      for (const [cat, val] of Object.entries(cats)) {
        totals[cat] = (totals[cat] ?? 0) + val
      }
    }

    const summary = Object.entries(totals)
      .map(([category, total]) => ({ category, totalCost: total.toFixed(2) }))
      .filter((r) => Number(r.totalCost) > 0)

    const daily = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cats]) => ({ date, ...Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, v])) }))

    return Response.json({ summary, daily })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
