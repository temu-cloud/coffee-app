import { NextRequest } from 'next/server'
import { requireSession, requireRole } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const roleError = requireRole(session, ['SUPER_ADMIN'])
  if (roleError) return roleError

  const { id } = await params
  const { role } = await request.json()

  const VALID_ROLES = ['NO_ROLE', 'SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'FACILITY_MANAGER']
  if (!VALID_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Prevent SUPER_ADMIN from demoting themselves
  if (session.user.id === id && role !== 'SUPER_ADMIN') {
    return Response.json({ error: 'You cannot change your own role' }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    return Response.json(updated)
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
  if (error || !session) return error!

  const roleError = requireRole(session, ['SUPER_ADMIN'])
  if (roleError) return roleError

  const { id } = await params

  if (session.user.id === id) {
    return Response.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    // Reassign all business records from this user to the deleting super admin,
    // then delete the user in a transaction to avoid FK violations.
    await prisma.$transaction([
      // Required createdById fields — reassign to the super admin
      prisma.inventoryItem.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.supplyItem.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.asset.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.priceHistory.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.dailySale.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.dailyExpense.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.payment.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      prisma.budget.updateMany({ where: { createdById: id }, data: { createdById: session.user.id } }),
      // Optional updatedById / deletedById / executedById — null them out
      prisma.inventoryItem.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      prisma.inventoryItem.updateMany({ where: { deletedById: id }, data: { deletedById: null } }),
      prisma.supplyItem.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      prisma.asset.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      prisma.dailySale.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      prisma.dailyExpense.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      prisma.payment.updateMany({ where: { executedById: id }, data: { executedById: null } }),
      prisma.budget.updateMany({ where: { updatedById: id }, data: { updatedById: null } }),
      // Now safe to delete
      prisma.user.delete({ where: { id } }),
    ])
    return Response.json({ success: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
