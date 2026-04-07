import axios, { AxiosError } from 'axios'
import type { AppError, ApiError } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

function normalizeError(error: AxiosError): AppError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as ApiError | undefined
  const message = data?.error ?? 'An unexpected error occurred'
  return { status, message }
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => Promise.reject(normalizeError(error))
)

export default api
