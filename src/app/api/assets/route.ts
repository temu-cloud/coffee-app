import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'
import { AssetCondition } from '@prisma/client'

const VALID_CONDITIONS: string[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count(),
    ])

    return Response.json({ data, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  try {
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

    const asset = await prisma.asset.create({
      data: {
        name,
        category,
        acquisitionDate: new Date(acquisitionDate),
        quantity: qty,
        unitCost: cost,
        totalCost,
        condition: condition as AssetCondition,
        notes: notes ?? null,
        createdById: session!.user.id,
      },
    })

    return Response.json(asset, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
