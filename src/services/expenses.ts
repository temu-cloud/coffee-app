import api from './axios'
import type { DailyExpense, ExpenseQuery, PaginatedResponse } from '@/types'

export const getExpenses = (params?: ExpenseQuery) =>
  api.get<PaginatedResponse<DailyExpense>>('/expenses', { params }).then((r) => r.data)

export const getExpense = (id: string) =>
  api.get<DailyExpense>(`/expenses/${id}`).then((r) => r.data)

export const createExpense = (data: Partial<DailyExpense>) =>
  api.post<DailyExpense>('/expenses', data).then((r) => r.data)

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`)
