import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/api-auth'

export async function GET(_request: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error
  // Any authenticated user can see the count
  void session

  try {
    const count = await prisma.stockMovement.count()
    return Response.json({ count })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
