import { requireSession, requireRole } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const roleError = requireRole(session, ['SUPER_ADMIN'])
  if (roleError) return roleError

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return Response.json(users)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
