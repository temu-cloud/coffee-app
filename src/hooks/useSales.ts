import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSales, createSale } from '@/services/sales'
import type { DailySale, SaleQuery } from '@/types'

export const useSales = (params?: SaleQuery) =>
  useQuery({
    queryKey: ['sales', params],
    queryFn: () => getSales(params),
    staleTime: 30_000,
  })

export const useCreateSale = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<DailySale>) => createSale(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
