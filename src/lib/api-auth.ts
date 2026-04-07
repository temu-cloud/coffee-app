import { headers } from 'next/headers'
import { auth, type Session } from './auth'

export async function requireSession() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) {
    return { session: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

export function requireRole(session: Session, roles: string[]): Response | null {
  if (!roles.includes(session.user.role as string)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
