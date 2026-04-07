import api from './axios'
import type { Asset, AssetQuery, PaginatedResponse } from '@/types'

export const getAssets = (params?: AssetQuery) =>
  api.get<PaginatedResponse<Asset>>('/assets', { params }).then((r) => r.data)

export const getAsset = (id: string) =>
  api.get<Asset>(`/assets/${id}`).then((r) => r.data)

export const createAsset = (data: Partial<Asset>) =>
  api.post<Asset>('/assets', data).then((r) => r.data)

export const updateAsset = (id: string, data: Partial<Asset>) =>
  api.put<Asset>(`/assets/${id}`, data).then((r) => r.data)

export const deleteAsset = (id: string) =>
  api.delete(`/assets/${id}`)
