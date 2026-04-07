import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from './auth'

// Use a relative base URL so auth requests always go to the same origin as the
// page — avoids CORS issues when the dev server runs on a non-3000 port.
const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

export const authClient = createAuthClient({
  baseURL,
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signOut, signUp, useSession } = authClient
