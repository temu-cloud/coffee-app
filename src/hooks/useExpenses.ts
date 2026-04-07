import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, createExpense, deleteExpense } from '@/services/expenses'
import type { DailyExpense, ExpenseQuery } from '@/types'

export const useExpenses = (params?: ExpenseQuery) =>
  useQuery({
    queryKey: ['expenses', params],
    queryFn: () => getExpenses(params),
    staleTime: 30_000,
  })

export const useCreateExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<DailyExpense>) => createExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
