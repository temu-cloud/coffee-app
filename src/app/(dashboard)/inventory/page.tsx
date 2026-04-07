'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '@/hooks/useInventory'
import InventoryFilters from '@/components/inventory/InventoryFilters'
import InventoryTable from '@/components/inventory/InventoryTable'
import InventoryForm from '@/components/inventory/InventoryForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { InventoryItem, ItemCategory } from '@/types'

export default function InventoryPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ItemCategory | ''>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)

  const { data, isLoading } = useInventoryItems({ search, category: category || undefined, page: 1, pageSize: 50 })
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()

  const handleFilter = useCallback((s: string, c: ItemCategory | '') => {
    setSearch(s)
    setCategory(c)
  }, [])

  function openAdd() {
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  async function handleFormSubmit(data: Partial<InventoryItem>) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data })
        toast('Item updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast('Item added successfully')
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
      toast('Item deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Could not delete item', 'error')
    }
  }

  const isFormLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Inventory</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} items total</p>
        </div>
        {canManage && <Button onClick={openAdd}>+ Add Item</Button>}
      </div>

      <InventoryFilters onFilter={handleFilter} />

      <InventoryTable
        items={data?.data ?? []}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Edit Item' : 'Add Item'}>
        <InventoryForm item={editItem} onSubmit={handleFormSubmit} loading={isFormLoading} />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Item" size="sm">
        <p className="text-amber-800 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
