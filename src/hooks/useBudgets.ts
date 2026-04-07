import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '@/services/budgets'
import type { Budget, BudgetQuery } from '@/types'

export const useBudgets = (params?: BudgetQuery) =>
  useQuery({
    queryKey: ['budgets', params],
    queryFn: () => getBudgets(params),
    staleTime: 30_000,
  })

export const useCreateBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Budget>) => createBudget(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useUpdateBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) => updateBudget(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useDeleteBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
