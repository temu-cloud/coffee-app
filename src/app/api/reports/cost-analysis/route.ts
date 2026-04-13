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
    // NOTE: DailySale.totalCost is intentionally excluded from cost analysis.
    // Sales cost of goods is already captured via InventoryItem purchases above.
    // Including DailySale.totalCost here would cause double-counting. (Requirement 7.4)
    const [ingredients, finishedGoods, assets, supplies, expenses, payments] = await Promise.all([
      prisma.inventoryItem.aggregate({
        where: { category: 'INGREDIENT', deletedAt: null, date: { gte: fromDate, lte: toDate } },
        _sum: { totalCost: true },
      }),
      prisma.inventoryItem.aggregate({
        where: { category: 'FINISHED_GOOD', deletedAt: null, date: { gte: fromDate, lte: toDate } },
        _sum: { totalCost: true },
      }),
      prisma.asset.aggregate({
        where: { acquisitionDate: { gte: fromDate, lte: toDate } },
        _sum: { totalCost: true },
      }),
      prisma.supplyItem.aggregate({
        where: { date: { gte: fromDate, lte: toDate } },
        _sum: { totalCost: true },
      }),
      prisma.dailyExpense.aggregate({
        where: { date: { gte: fromDate, lte: toDate } },
        _sum: { totalPrice: true },
      }),
      prisma.payment.aggregate({
        where: { date: { gte: fromDate, lte: toDate }, executedAt: { not: null } },
        _sum: { amount: true },
      }),
    ])

    const data = [
      { category: 'Inventory — Ingredients', totalCost: Number(ingredients._sum.totalCost ?? 0).toFixed(2) },
      { category: 'Inventory — Finished Goods', totalCost: Number(finishedGoods._sum.totalCost ?? 0).toFixed(2) },
      { category: 'Assets', totalCost: Number(assets._sum.totalCost ?? 0).toFixed(2) },
      { category: 'Supplies', totalCost: Number(supplies._sum.totalCost ?? 0).toFixed(2) },
      { category: 'Expenses', totalCost: Number(expenses._sum.totalPrice ?? 0).toFixed(2) },
      { category: 'Payments', totalCost: Number(payments._sum.amount ?? 0).toFixed(2) },
    ].filter((row) => Number(row.totalCost) > 0)

    return Response.json(data)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
