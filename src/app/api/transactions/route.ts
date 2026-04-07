import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') as 'STOCK_IN' | 'STOCK_OUT' | null
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const where = {
      ...(type ? { type } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + 'T23:59:59.999Z') } : {}),
            },
          }
        : {}),
      ...(search
        ? { product: { name: { contains: search, mode: 'insensitive' as const } } }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return Response.json({ data, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession()
  if (error || !session) return error

  try {
    const body = await request.json()
    const { productId, type, quantity, note } = body

    if (!productId || !type || !quantity) {
      return Response.json({ error: 'productId, type, and quantity are required' }, { status: 400 })
    }

    if (!['STOCK_IN', 'STOCK_OUT'].includes(type)) {
      return Response.json({ error: 'type must be STOCK_IN or STOCK_OUT' }, { status: 400 })
    }

    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      return Response.json({ error: 'quantity must be a positive integer' }, { status: 400 })
    }

    if (type === 'STOCK_OUT' && (!note || !note.trim())) {
      return Response.json({ error: 'note is required for STOCK_OUT transactions' }, { status: 400 })
    }

    const userId = session.user.id

    const transaction = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw Object.assign(new Error('Product not found'), { status: 404 })

      if (type === 'STOCK_OUT' && product.stock < quantity) {
        throw Object.assign(new Error('Insufficient stock'), { status: 422 })
      }

      const delta = type === 'STOCK_IN' ? quantity : -quantity
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: delta } },
      })

      return tx.transaction.create({
        data: { productId, userId, type, quantity, note: note ?? null },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      })
    })

    return Response.json(transaction, { status: 201 })
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string }
    if (err.status === 404) return Response.json({ error: 'Product not found' }, { status: 404 })
    if (err.status === 422) return Response.json({ error: 'Insufficient stock' }, { status: 422 })
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
