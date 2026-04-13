import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'ADMIN'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const distinct = searchParams.get('distinct') === 'true'

  try {
    const data = await prisma.priceHistory.findMany({
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    })

    if (distinct) {
      const seen = new Set<string>()
      const unique = data.filter((p) => {
        if (seen.has(p.itemName)) return false
        seen.add(p.itemName)
        return true
      })
      return Response.json(unique)
    }

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
    const { itemName, price, effectiveDate, category, unitCost, inventoryItemId } = body

    if (!itemName || price == null || !effectiveDate) {
      return Response.json(
        { error: 'itemName, price, and effectiveDate are required' },
        { status: 400 }
      )
    }

    const priceNum = Number(price)
    if (priceNum <= 0) {
      return Response.json({ error: 'price must be greater than 0' }, { status: 400 })
    }

    const record = await prisma.priceHistory.create({
      data: {
        itemName,
        price: priceNum,
        effectiveDate: new Date(effectiveDate),
        category: category ?? 'OTHER',
        unitCost: unitCost != null ? Number(unitCost) : null,
        inventoryItemId: inventoryItemId ?? null,
        createdById: session!.user.id,
      },
    })

    return Response.json(record, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
