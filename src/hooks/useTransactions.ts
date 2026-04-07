import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransactions, createTransaction } from '@/services/transactions'
import type { TransactionQuery } from '@/types'

export const useTransactions = (params?: TransactionQuery) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    staleTime: 30_000,
  })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
