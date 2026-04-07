import api from './axios'
import type { Product, PaginatedResponse, ProductQuery } from '@/types'

export const getProducts = (params?: ProductQuery) =>
  api.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data)

export const getProduct = (id: string) =>
  api.get<Product>(`/products/${id}`).then((r) => r.data)

export const createProduct = (data: FormData) =>
  api.post<Product>('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const updateProduct = (id: string, data: FormData) =>
  api.put<Product>(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`).then((r) => r.data)
