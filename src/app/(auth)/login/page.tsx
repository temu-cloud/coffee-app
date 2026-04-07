'use client'
 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError('Invalid email or password.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-800 rounded-full mb-4">
            <img
              src="/d.png"
              alt="Coffee Icon"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900">Dammote Coffee</h1>
          <p className="text-amber-700 mt-1">Sign in to manage your stock</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-300"
                placeholder="temuteme@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-amber-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-amber-800 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
