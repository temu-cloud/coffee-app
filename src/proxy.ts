import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

const AUTH_PAGES = ['/login', '/signup']

// Role-to-allowed-paths mapping (dashboard sub-paths only)
const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  SUPER_ADMIN: [], // no restrictions
  NO_ROLE: [],     // only dashboard root (handled by isAllowedForRole)
  ADMIN: ['/sales', '/expenses'],
  FINANCE_MANAGER: ['/prices', '/payments', '/reports', '/budgets', '/inventory', '/supplies', '/assets'],
  FACILITY_MANAGER: ['/inventory', '/supplies', '/assets'],
}

// Default redirect per role when accessing a forbidden path
const ROLE_DEFAULT_REDIRECT: Record<string, string> = {
  NO_ROLE: '/',
  ADMIN: '/sales',
  FINANCE_MANAGER: '/reports/pnl',
  FACILITY_MANAGER: '/inventory',
}

function isDashboardPath(pathname: string): boolean {
  // Strip the route group prefix — in the filesystem it's (dashboard) but URLs don't include it
  return (
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  )
}

function isAllowedForRole(role: string, pathname: string): boolean {
  if (role === 'SUPER_ADMIN') return true

  // NO_ROLE users can only access the dashboard root
  if (role === 'NO_ROLE') return pathname === '/'

  const allowed = ROLE_ALLOWED_PATHS[role]
  if (!allowed) return false

  // Dashboard root is always allowed
  if (pathname === '/') return true

  return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))
  const isPublic =
    isAuthPage ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  const sessionCookie =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token')

  // Logged-in user hitting an auth page → send to dashboard
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Unauthenticated user hitting a protected page → send to login
  if (!isPublic && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access guard for dashboard paths (skip for all /api/ routes)
  if (!isPublic && sessionCookie && isDashboardPath(pathname) && !pathname.startsWith('/api/')) {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const role = session.user.role as string
      if (!isAllowedForRole(role, pathname)) {
        const redirectPath = ROLE_DEFAULT_REDIRECT[role] ?? '/'
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    } catch {
      // If session check fails, let the request through (API route will handle auth)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$).*)'],
}
