import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.dailySale.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const { itemName, unitPrice, quantitySold, date, unitCost, inventoryItemId, priceHistoryId } = body

    if (!itemName || unitPrice == null || quantitySold == null || !date) {
      return Response.json(
        { error: 'itemName, unitPrice, quantitySold, and date are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantitySold)
    const price = Number(unitPrice)
    const cost = unitCost != null ? Number(unitCost) : 0

    if (qty <= 0) return Response.json({ error: 'quantitySold must be > 0' }, { status: 400 })
    if (price <= 0) return Response.json({ error: 'unitPrice must be > 0' }, { status: 400 })

    const saleTotal = qty * price
    const totalCost = cost * qty
    const profit = saleTotal - totalCost

    const sale = await prisma.dailySale.update({
      where: { id },
      data: {
        date: new Date(date),
        itemName,
        unitPrice: price,
        unitCost: cost,
        quantitySold: qty,
        saleTotal,
        totalCost,
        profit,
        inventoryItemId: inventoryItemId ?? null,
        priceHistoryId: priceHistoryId ?? null,
        updatedById: session!.user.id,
      },
    })

    return Response.json(sale)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.dailySale.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.dailySale.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
