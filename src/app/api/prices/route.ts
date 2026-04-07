import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(_request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  try {
    const data = await prisma.priceHistory.findMany({
      include: { inventoryItem: true },
      orderBy: { effectiveDate: 'desc' },
    })
    return Response.json(data)
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
    const { inventoryItemId, price, effectiveDate } = body

    if (!inventoryItemId || price == null || !effectiveDate) {
      return Response.json(
        { error: 'inventoryItemId, price, and effectiveDate are required' },
        { status: 400 }
      )
    }

    const priceNum = Number(price)
    if (priceNum <= 0) {
      return Response.json({ error: 'price must be greater than 0' }, { status: 400 })
    }

    const record = await prisma.priceHistory.create({
      data: {
        inventoryItemId,
        price: priceNum,
        effectiveDate: new Date(effectiveDate),
        createdById: session!.user.id,
      },
    })

    return Response.json(record, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
