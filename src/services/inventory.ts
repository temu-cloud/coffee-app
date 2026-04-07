import api from './axios'
import type { InventoryItem, InventoryQuery, PaginatedResponse } from '@/types'

export const getInventoryItems = (params?: InventoryQuery) =>
  api.get<PaginatedResponse<InventoryItem>>('/inventory', { params }).then((r) => r.data)

export const getInventoryItem = (id: string) =>
  api.get<InventoryItem>(`/inventory/${id}`).then((r) => r.data)

export const createInventoryItem = (data: Partial<InventoryItem>) =>
  api.post<InventoryItem>('/inventory', data).then((r) => r.data)

export const updateInventoryItem = (id: string, data: Partial<InventoryItem>) =>
  api.put<InventoryItem>(`/inventory/${id}`, data).then((r) => r.data)

export const deleteInventoryItem = (id: string) =>
  api.delete(`/inventory/${id}`).then((r) => r.data)
