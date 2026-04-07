import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/api-auth'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(product)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

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

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    let imageUrl = existing.imageUrl
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      imageUrl = await uploadImage(buffer)
    }

    const product = await prisma.product.update({
      where: { id },
      data: { name, category, unit, lowStockThreshold, imageUrl },
    })

    return Response.json(product)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const txCount = await prisma.transaction.count({ where: { productId: id } })
    if (txCount > 0) {
      return Response.json(
        { error: 'Cannot delete product with transaction history' },
        { status: 409 }
      )
    }

    await prisma.product.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
