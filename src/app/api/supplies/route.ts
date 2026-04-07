import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const roleError = requireRole(session!, ['SUPER_ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER'])
  if (roleError) return roleError

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [data, total] = await Promise.all([
      prisma.supplyItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.supplyItem.count({ where }),
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
    const { date, name, units, quantity, unitCost, supplier } = body

    if (!date || !name || !units || quantity == null || unitCost == null || !supplier) {
      return Response.json(
        { error: 'date, name, units, quantity, unitCost, and supplier are required' },
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

    const item = await prisma.supplyItem.create({
      data: {
        date: new Date(date),
        name,
        units,
        quantity: qty,
        unitCost: cost,
        totalCost,
        supplier,
        createdById: session!.user.id,
      },
    })

    return Response.json(item, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
