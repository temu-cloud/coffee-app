import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAssets, createAsset, updateAsset } from '@/services/assets'
import type { Asset, AssetQuery } from '@/types'

export const useAssets = (params?: AssetQuery) =>
  useQuery({
    queryKey: ['assets', params],
    queryFn: () => getAssets(params),
    staleTime: 30_000,
  })

export const useCreateAsset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Asset>) => createAsset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export const useUpdateAsset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) => updateAsset(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
