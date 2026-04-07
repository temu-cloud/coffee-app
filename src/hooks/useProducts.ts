import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '@/services/products'
import type { ProductQuery } from '@/types'

export const useProducts = (params?: ProductQuery) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    staleTime: 30_000,
  })

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
