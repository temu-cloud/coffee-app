import api from './axios'
import type { PriceHistory } from '@/types'

export const getPrices = (params?: Record<string, unknown>) =>
  api.get<PriceHistory[]>('/prices', { params }).then((r) => r.data)

export const createPrice = (data: Partial<PriceHistory>) =>
  api.post<PriceHistory>('/prices', data).then((r) => r.data)

export const getPriceHistory = (inventoryItemId: string) =>
  api.get<PriceHistory[]>(`/prices/${inventoryItemId}/history`).then((r) => r.data)
