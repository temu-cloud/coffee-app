import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupplyItems, createSupplyItem, updateSupplyItem } from '@/services/supplies'
import type { SupplyItem, SupplyQuery } from '@/types'

export const useSupplyItems = (params?: SupplyQuery) =>
  useQuery({
    queryKey: ['supplies', params],
    queryFn: () => getSupplyItems(params),
    staleTime: 30_000,
  })

export const useCreateSupplyItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SupplyItem>) => createSupplyItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplies'] })
    },
  })
}

export const useUpdateSupplyItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplyItem> }) =>
      updateSupplyItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplies'] })
    },
  })
}
