'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useSupplyItems, useCreateSupplyItem, useUpdateSupplyItem, useDeleteSupplyItem } from '@/hooks/useSupplies'
import SupplyFilters from '@/components/supplies/SupplyFilters'
import SupplyTable from '@/components/supplies/SupplyTable'
import SupplyForm from '@/components/supplies/SupplyForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { SupplyItem } from '@/types'

export default function SuppliesPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<SupplyItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupplyItem | null>(null)

  const { data, isLoading } = useSupplyItems({ search, page: 1, pageSize: 50 })
  const createMutation = useCreateSupplyItem()
  const updateMutation = useUpdateSupplyItem()
  const deleteMutation = useDeleteSupplyItem()

  const handleFilter = useCallback((s: string) => setSearch(s), [])

  function openAdd() { setEditItem(null); setFormOpen(true) }
  function openEdit(item: SupplyItem) { setEditItem(item); setFormOpen(true) }

  async function handleFormSubmit(data: Partial<SupplyItem>) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data })
        toast('Supply updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast('Supply added successfully')
      }
      setFormOpen(false)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Something went wrong', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Supply deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Could not delete', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Supplies</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} items total</p>
        </div>
        {canManage && <Button onClick={openAdd}>+ Add Supply</Button>}
      </div>
      <SupplyFilters onFilter={handleFilter} />
      <SupplyTable items={data?.data ?? []} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'Edit Supply' : 'Add Supply'}>
        <SupplyForm item={editItem} onSubmit={handleFormSubmit} loading={createMutation.isPending || updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Supply" size="sm">
        <p className="text-amber-800 mb-6">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
