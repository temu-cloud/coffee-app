import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'
import { AssetCondition } from '@prisma/client'

const VALID_CONDITIONS: string[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']

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
    const asset = await prisma.asset.findUnique({ where: { id } })
    if (!asset) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(asset)
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
    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, category, acquisitionDate, quantity, unitCost, condition, notes } = body

    if (!name || !category || !acquisitionDate || quantity == null || unitCost == null || !condition) {
      return Response.json(
        { error: 'name, category, acquisitionDate, quantity, unitCost, and condition are required' },
        { status: 400 }
      )
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      return Response.json(
        { error: 'condition must be one of EXCELLENT, GOOD, FAIR, POOR' },
        { status: 400 }
      )
    }

    const cost = Number(unitCost)
    if (cost <= 0) {
      return Response.json({ error: 'unitCost must be greater than 0' }, { status: 400 })
    }

    const qty = parseInt(quantity)
    const totalCost = qty * cost

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        category,
        acquisitionDate: new Date(acquisitionDate),
        quantity: qty,
        unitCost: cost,
        totalCost,
        condition: condition as AssetCondition,
        notes: notes ?? null,
        updatedById: session!.user.id,
      },
    })

    return Response.json(asset)
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
    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    await prisma.asset.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
