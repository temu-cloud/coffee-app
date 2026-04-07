import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/services/inventory'
import type { InventoryItem, InventoryQuery } from '@/types'

export const useInventoryItems = (params?: InventoryQuery) =>
  useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventoryItems(params),
    staleTime: 30_000,
  })

export const useInventoryItem = (id: string) =>
  useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getInventoryItem(id),
    enabled: !!id,
  })

export const useCreateInventoryItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) => createInventoryItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useUpdateInventoryItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      updateInventoryItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteInventoryItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
