import api from './axios'
import type { Transaction, PaginatedResponse, TransactionQuery } from '@/types'

export interface CreateTransactionInput {
  productId: string
  type: 'STOCK_IN' | 'STOCK_OUT'
  quantity: number
  note?: string
}

export const getTransactions = (params?: TransactionQuery) =>
  api.get<PaginatedResponse<Transaction>>('/transactions', { params }).then((r) => r.data)

export const createTransaction = (data: CreateTransactionInput) =>
  api.post<Transaction>('/transactions', data).then((r) => r.data)
