import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const periodYear = searchParams.get('periodYear')
  const periodMonth = searchParams.get('periodMonth')

  try {
    const where: Record<string, unknown> = {}
    if (periodYear) where.periodYear = parseInt(periodYear)
    if (periodMonth) where.periodMonth = parseInt(periodMonth)

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    })

    // For each budget, compute actualCosts
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const periodStart = new Date(budget.periodYear, budget.periodMonth - 1, 1)
        const periodEnd = new Date(budget.periodYear, budget.periodMonth, 1)

        const [expenseAgg, paymentAgg] = await Promise.all([
          prisma.dailyExpense.aggregate({
            where: {
              itemName: budget.category,
              date: { gte: periodStart, lt: periodEnd },
            },
            _sum: { totalPrice: true },
          }),
          prisma.payment.aggregate({
            where: {
              description: { contains: budget.category },
              date: { gte: periodStart, lt: periodEnd },
              executedAt: { not: null },
            },
            _sum: { amount: true },
          }),
        ])

        const actualCosts =
          Number(expenseAgg._sum.totalPrice ?? 0) + Number(paymentAgg._sum.amount ?? 0)
        const allocatedAmount = Number(budget.allocatedAmount)
        const utilization = allocatedAmount > 0 ? actualCosts / allocatedAmount : 0

        return {
          ...budget,
          actualCosts: actualCosts.toFixed(2),
          utilization: utilization.toFixed(4),
        }
      })
    )

    return Response.json(enriched)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  try {
    const body = await request.json()
    const { periodMonth, periodYear, category, allocatedAmount } = body

    if (periodMonth == null || periodYear == null || !category || allocatedAmount == null) {
      return Response.json(
        { error: 'periodMonth, periodYear, category, and allocatedAmount are required' },
        { status: 400 }
      )
    }

    const amt = Number(allocatedAmount)
    if (amt <= 0) {
      return Response.json({ error: 'allocatedAmount must be greater than 0' }, { status: 400 })
    }

    const budget = await prisma.budget.create({
      data: {
        periodMonth: parseInt(periodMonth),
        periodYear: parseInt(periodYear),
        category,
        allocatedAmount: amt,
        createdById: session!.user.id,
      },
    })

    return Response.json(budget, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
