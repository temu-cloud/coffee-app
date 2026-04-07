import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPayments, createPayment, updatePayment, executePayment, deletePayment } from '@/services/payments'
import type { Payment, PaymentQuery } from '@/types'

export const usePayments = (params?: PaymentQuery) =>
  useQuery({
    queryKey: ['payments', params],
    queryFn: () => getPayments(params),
    staleTime: 30_000,
  })

export const useCreatePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Payment>) => createPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useUpdatePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) => updatePayment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useExecutePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => executePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeletePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
