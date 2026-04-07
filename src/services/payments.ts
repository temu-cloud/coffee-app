import api from './axios'
import type { Payment, PaymentQuery, PaginatedResponse } from '@/types'

export const getPayments = (params?: PaymentQuery) =>
  api.get<PaginatedResponse<Payment>>('/payments', { params }).then((r) => r.data)

export const getPayment = (id: string) =>
  api.get<Payment>(`/payments/${id}`).then((r) => r.data)

export const createPayment = (data: Partial<Payment>) =>
  api.post<Payment>('/payments', data).then((r) => r.data)

export const updatePayment = (id: string, data: Partial<Payment>) =>
  api.put<Payment>(`/payments/${id}`, data).then((r) => r.data)

export const executePayment = (id: string) =>
  api.post<Payment>(`/payments/${id}/execute`).then((r) => r.data)

export const deletePayment = (id: string) =>
  api.delete(`/payments/${id}`)
