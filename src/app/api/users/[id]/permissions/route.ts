import { NextRequest } from 'next/server'
import { requireSession } from '@/lib/api-auth'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import prisma from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error || !session) return error!
  if (session.user.role !== 'MANAGER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const perms = await db.staffPermission.findUnique({ where: { userId: id } })
    // Return defaults if no record yet
    return Response.json(perms ?? {
      userId: id,
      canAddStock: true,
      canUseStock: true,
      canAddProducts: false,
      canEditProducts: false,
      canViewReports: false,
    })
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
  if (error || !session) return error!
  if (session.user.role !== 'MANAGER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { canAddStock, canUseStock, canAddProducts, canEditProducts, canViewReports } = body

  try {
    const perms = await db.staffPermission.upsert({
      where: { userId: id },
      update: { canAddStock, canUseStock, canAddProducts, canEditProducts, canViewReports },
      create: { userId: id, canAddStock, canUseStock, canAddProducts, canEditProducts, canViewReports },
    })
    return Response.json(perms)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
