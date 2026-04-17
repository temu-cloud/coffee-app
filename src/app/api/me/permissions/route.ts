import { requireSession } from '@/lib/api-auth'

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

  // NO_ROLE or unknown — minimal permissions
  return Response.json({
    canAddStock: false,
    canUseStock: false,
    canAddProducts: false,
    canEditProducts: false,
    canViewReports: false,
  })
}
