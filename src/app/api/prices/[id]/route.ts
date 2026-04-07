import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const record = await prisma.priceHistory.findUnique({
      where: { id },
      include: { inventoryItem: true },
    })
    if (!record) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(record)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.priceHistory.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()

    if ('price' in body || 'effectiveDate' in body) {
      return Response.json(
        { error: 'price and effectiveDate cannot be updated' },
        { status: 400 }
      )
    }

    // Only non-price/non-effectiveDate metadata can be updated
    // Currently PriceHistory has no other mutable fields beyond what's set at creation,
    // so we return the existing record unchanged (future fields can be added here)
    const record = await prisma.priceHistory.findUnique({
      where: { id },
      include: { inventoryItem: true },
    })

    return Response.json(record)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
