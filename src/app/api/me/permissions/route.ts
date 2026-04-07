import { requireSession } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const role = session.user.role as string

  // SUPER_ADMIN and FINANCE_MANAGER have all permissions implicitly
  if (role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER') {
    return Response.json({
      canAddStock: true,
      canUseStock: true,
      canAddProducts: true,
      canEditProducts: true,
      canViewReports: true,
    })
  }

  // ADMIN can record sales/expenses but not manage products
  if (role === 'ADMIN') {
    return Response.json({
      canAddStock: false,
      canUseStock: true,
      canAddProducts: false,
      canEditProducts: false,
      canViewReports: false,
    })
  }

  // FACILITY_MANAGER can manage products and stock
  if (role === 'FACILITY_MANAGER') {
    return Response.json({
      canAddStock: true,
      canUseStock: false,
      canAddProducts: true,
      canEditProducts: true,
      canViewReports: false,
    })
  }

  // Legacy STAFF fallback — check StaffPermission table
  try {
    const perms = await prisma.staffPermission.findUnique({
      where: { userId: session.user.id },
    })
    return Response.json(perms ?? {
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
