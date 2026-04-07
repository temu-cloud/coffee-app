import api from './axios'
import type { SupplyItem, SupplyQuery, PaginatedResponse } from '@/types'

export const getSupplyItems = (params?: SupplyQuery) =>
  api.get<PaginatedResponse<SupplyItem>>('/supplies', { params }).then((r) => r.data)

export const getSupplyItem = (id: string) =>
  api.get<SupplyItem>(`/supplies/${id}`).then((r) => r.data)

export const createSupplyItem = (data: Partial<SupplyItem>) =>
  api.post<SupplyItem>('/supplies', data).then((r) => r.data)

export const updateSupplyItem = (id: string, data: Partial<SupplyItem>) =>
  api.put<SupplyItem>(`/supplies/${id}`, data).then((r) => r.data)

export const deleteSupplyItem = (id: string) =>
  api.delete(`/supplies/${id}`)
