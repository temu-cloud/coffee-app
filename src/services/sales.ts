import api from './axios'
import type { DailySale, SaleQuery, PaginatedResponse } from '@/types'

export const getSales = (params?: SaleQuery) =>
  api.get<PaginatedResponse<DailySale>>('/sales', { params }).then((r) => r.data)

export const getSale = (id: string) =>
  api.get<DailySale>(`/sales/${id}`).then((r) => r.data)

export const createSale = (data: Partial<DailySale>) =>
  api.post<DailySale>('/sales', data).then((r) => r.data)

export const deleteSale = (id: string) =>
  api.delete(`/sales/${id}`)

export const updateSale = (id: string, data: Partial<DailySale>) =>
  api.put<DailySale>(`/sales/${id}`, data).then((r) => r.data)
