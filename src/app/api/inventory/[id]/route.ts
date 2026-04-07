import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'
import { ItemCategory } from '@prisma/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const item = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!item || item.deletedAt !== null) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(item)
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing || existing.deletedAt !== null) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { category, date, name, units, quantity, unitCost, supplier } = body

    if (!category || !date || !name || !units || quantity == null || unitCost == null || !supplier) {
      return Response.json(
        { error: 'category, date, name, units, quantity, unitCost, and supplier are required' },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    const cost = Number(unitCost)

    if (qty <= 0) {
      return Response.json({ error: 'quantity must be greater than 0' }, { status: 400 })
    }
    if (cost <= 0) {
      return Response.json({ error: 'unitCost must be greater than 0' }, { status: 400 })
    }

    const totalCost = qty * cost

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        category: category as ItemCategory,
        date: new Date(date),
        name,
        units,
        quantity: qty,
        unitCost: cost,
        totalCost,
        supplier,
        updatedById: session!.user.id,
      },
    })

    return Response.json(item)
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

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { id } = await params

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing || existing.deletedAt !== null) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: session!.user.id,
      },
    })

    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
