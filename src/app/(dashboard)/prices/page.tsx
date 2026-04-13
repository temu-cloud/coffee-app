'use client'

import { useState } from 'react'
import { usePrices, useCreatePrice, useUpdatePrice, useDeletePrice } from '@/hooks/usePrices'
import PriceForm from '@/components/prices/PriceForm'
import PriceTable from '@/components/prices/PriceTable'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { PriceHistory } from '@/types'

export default function PricesPage() {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<PriceHistory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PriceHistory | null>(null)

  const { data: prices, isLoading } = usePrices()
  const createMutation = useCreatePrice()
  const updateMutation = useUpdatePrice()
  const deleteMutation = useDeletePrice()

  function openAdd() {
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(item: PriceHistory) {
    setEditItem(item)
    setFormOpen(true)
  }

  async function handleFormSubmit(data: Partial<PriceHistory>) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data })
        toast('Price updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast('Price set successfully')
      }
      setFormOpen(false)
      setEditItem(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Something went wrong', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Price deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Could not delete', 'error')
    }
  }

  const priceList = Array.isArray(prices) ? prices : []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Prices</h2>
          <p className="text-sm text-amber-500">Set selling prices for any item</p>
        </div>
        <Button onClick={openAdd}>+ Set Price</Button>
      </div>

      <PriceTable
        prices={priceList}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null) }}
        title={editItem ? 'Edit Price' : 'Set Price'}
      >
        <PriceForm
          item={editItem}
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Price" size="sm">
        <p className="text-amber-800 mb-6">
          Delete price for <strong>{deleteTarget?.itemName}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
