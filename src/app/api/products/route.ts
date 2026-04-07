import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/api-auth'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'))

  try {
    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      ...(category ? { category } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ])

    return Response.json({ data, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const unit = formData.get('unit') as string
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string)
    const imageFile = formData.get('image') as File | null

    if (!name || !category || !unit || isNaN(lowStockThreshold)) {
      return Response.json({ error: 'name, category, unit, and lowStockThreshold are required' }, { status: 400 })
    }

    let imageUrl: string | undefined
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      imageUrl = await uploadImage(buffer)
    }

    const product = await prisma.product.create({
      data: { name, category, unit, lowStockThreshold, imageUrl },
    })

    return Response.json(product, { status: 201 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
