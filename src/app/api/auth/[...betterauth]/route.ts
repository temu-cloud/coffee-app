import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const { GET, POST: _POST } = toNextJsHandler(auth)

export { GET }

export async function POST(request: Request) {
  const url = new URL(request.url)
  const isSignUp = url.pathname.endsWith('/sign-up/email')

  const response = await _POST(request)

  if (isSignUp && response.ok) {
    try {
      // If only one user exists, they're the first — promote to SUPER_ADMIN
      const count = await prisma.user.count()
      if (count === 1) {
        const first = await prisma.user.findFirst()
        if (first) {
          await prisma.user.update({ where: { id: first.id }, data: { role: 'SUPER_ADMIN' } })
        }
      }
    } catch (e) {
      console.error('Failed to promote first user to SUPER_ADMIN:', e)
    }
  }

  return response
}
