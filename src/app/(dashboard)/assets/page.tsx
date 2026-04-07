'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets'
import AssetFilters from '@/components/assets/AssetFilters'
import AssetTable from '@/components/assets/AssetTable'
import AssetForm from '@/components/assets/AssetForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Asset } from '@/types'

export default function AssetsPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FACILITY_MANAGER'

  const [, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)

  const { data, isLoading } = useAssets({ page: 1, pageSize: 50 })
  const createMutation = useCreateAsset()
  const updateMutation = useUpdateAsset()
  const deleteMutation = useDeleteAsset()

  const handleFilter = useCallback((s: string) => setSearch(s), [])

  function openAdd() { setEditAsset(null); setFormOpen(true) }
  function openEdit(asset: Asset) { setEditAsset(asset); setFormOpen(true) }

  async function handleFormSubmit(data: Partial<Asset>) {
    try {
      if (editAsset) {
        await updateMutation.mutateAsync({ id: editAsset.id, data })
        toast('Asset updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast('Asset added successfully')
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
      toast('Asset deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Could not delete', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Assets</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} items total</p>
        </div>
        {canManage && <Button onClick={openAdd}>+ Add Asset</Button>}
      </div>
      <AssetFilters onFilter={handleFilter} />
      <AssetTable assets={data?.data ?? []} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editAsset ? 'Edit Asset' : 'Add Asset'}>
        <AssetForm asset={editAsset} onSubmit={handleFormSubmit} loading={createMutation.isPending || updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Asset" size="sm">
        <p className="text-amber-800 mb-6">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
