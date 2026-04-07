'use client'

import { useCallback, useState } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import ProductFilters from '@/components/products/ProductFilters'
import ProductTable from '@/components/products/ProductTable'
import ProductForm from '@/components/products/ProductForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Product } from '@/types'

export default function ProductsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const { data, isLoading } = useProducts({ search, category, page, pageSize: 50 })
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const handleFilter = useCallback((s: string, c: string) => {
    setSearch(s)
    setCategory(c)
  }, [])

  function openAdd() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setFormOpen(true)
  }

  async function handleFormSubmit(fd: FormData) {
    try {
      if (editProduct) {
        await updateMutation.mutateAsync({ id: editProduct.id, data: fd })
        toast('Product updated successfully')
      } else {
        await createMutation.mutateAsync(fd)
        toast('Product added successfully')
      }
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Product deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Could not delete product', 'error')
    }
  }

  const isFormLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Product Catalog</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} products total</p>
        </div>
        <Button onClick={openAdd}>+ Add Product</Button>
      </div>

      {/* Filters */}
      <ProductFilters onFilter={handleFilter} />

      {/* Table */}
      <ProductTable
        products={data?.data ?? []}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* Add / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          product={editProduct}
          onSubmit={handleFormSubmit}
          loading={isFormLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-amber-800 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
