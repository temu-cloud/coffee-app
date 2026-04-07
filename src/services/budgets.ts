import api from './axios'
import type { Budget, BudgetQuery, PaginatedResponse } from '@/types'

export const getBudgets = (params?: BudgetQuery) =>
  api.get<PaginatedResponse<Budget>>('/budgets', { params }).then((r) => r.data)

export const getBudget = (id: string) =>
  api.get<Budget>(`/budgets/${id}`).then((r) => r.data)

export const createBudget = (data: Partial<Budget>) =>
  api.post<Budget>('/budgets', data).then((r) => r.data)

export const updateBudget = (id: string, data: Partial<Budget>) =>
  api.put<Budget>(`/budgets/${id}`, data).then((r) => r.data)
