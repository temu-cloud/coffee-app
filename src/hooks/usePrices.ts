import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPrices, getPriceHistory, createPrice } from '@/services/prices'
import type { PriceHistory } from '@/types'

export const usePrices = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['prices', params],
    queryFn: () => getPrices(params),
    staleTime: 30_000,
  })

export const usePriceHistory = (inventoryItemId: string) =>
  useQuery({
    queryKey: ['prices', 'history', inventoryItemId],
    queryFn: () => getPriceHistory(inventoryItemId),
    enabled: !!inventoryItemId,
    staleTime: 30_000,
  })

export const useCreatePrice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PriceHistory>) => createPrice(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prices'] })
      qc.invalidateQueries({ queryKey: ['sales'] })
    },
  })
}
