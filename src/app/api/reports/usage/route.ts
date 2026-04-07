import { NextRequest } from 'next/server'
import { requireSession } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return Response.json({ error: 'from and to query params are required' }, { status: 400 })
  }

  try {
    const fromDate = new Date(from)
    const toDate = new Date(to + 'T23:59:59.999Z')

    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    })

    // Daily usage per product
    const dailyMap: Record<string, Record<string, { productName: string; quantity: number }>> = {}
    for (const tx of transactions) {
      if (tx.type !== 'STOCK_OUT') continue
      const date = tx.createdAt.toISOString().slice(0, 10)
      if (!dailyMap[date]) dailyMap[date] = {}
      if (!dailyMap[date][tx.productId]) {
        dailyMap[date][tx.productId] = { productName: tx.product.name, quantity: 0 }
      }
      dailyMap[date][tx.productId].quantity += tx.quantity
    }

    const dailyUsage = Object.entries(dailyMap).flatMap(([date, products]) =>
      Object.entries(products).map(([productId, { productName, quantity }]) => ({
        date,
        productId,
        productName,
        quantity,
      }))
    )

    // Summary per product
    const summaryMap: Record<string, { productName: string; totalStockIn: number; totalStockOut: number }> = {}
    for (const tx of transactions) {
      if (!summaryMap[tx.productId]) {
        summaryMap[tx.productId] = { productName: tx.product.name, totalStockIn: 0, totalStockOut: 0 }
      }
      if (tx.type === 'STOCK_IN') summaryMap[tx.productId].totalStockIn += tx.quantity
      else summaryMap[tx.productId].totalStockOut += tx.quantity
    }

    const summary = Object.entries(summaryMap).map(([productId, s]) => ({
      productId,
      productName: s.productName,
      totalStockIn: s.totalStockIn,
      totalStockOut: s.totalStockOut,
      netChange: s.totalStockIn - s.totalStockOut,
    }))

    // Top products by stock out
    const topProducts = [...summary]
      .sort((a, b) => b.totalStockOut - a.totalStockOut)
      .map(({ productId, productName, totalStockOut }) => ({ productId, productName, totalStockOut }))

    return Response.json({ dailyUsage, topProducts, summary })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
