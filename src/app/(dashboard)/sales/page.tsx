'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from '@/hooks/useSales'
import SaleFilters from '@/components/sales/SaleFilters'
import SaleTable from '@/components/sales/SaleTable'
import SaleForm from '@/components/sales/SaleForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { DailySale } from '@/types'

export default function SalesPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canCreate = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editSale, setEditSale] = useState<DailySale | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DailySale | null>(null)

  const { data, isLoading } = useSales({ from: from || undefined, to: to || undefined, page: 1, pageSize: 50 })
  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale()
  const deleteMutation = useDeleteSale()

  const handleFilter = useCallback((f: string, t: string) => { setFrom(f); setTo(t) }, [])

  function openAdd() {
    setEditSale(null)
    setFormOpen(true)
  }

  function openEdit(sale: DailySale) {
    setEditSale(sale)
    setFormOpen(true)
  }

  async function handleFormSubmit(saleData: Partial<DailySale>) {
    try {
      if (editSale) {
        await updateMutation.mutateAsync({ id: editSale.id, data: saleData })
        toast('Sale updated successfully')
      } else {
        await createMutation.mutateAsync(saleData)
        toast('Sale recorded successfully')
      }
      setFormOpen(false)
      setEditSale(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Something went wrong', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Sale deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Could not delete', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Sales</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} records total</p>
        </div>
        {canCreate && <Button onClick={openAdd}>+ Record Sale</Button>}
      </div>

      <SaleFilters onFilter={handleFilter} />

      <SaleTable
        sales={data?.data ?? []}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSale(null) }}
        title={editSale ? 'Edit Sale' : 'Record Sale'}
      >
        <SaleForm
          sale={editSale}
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Sale" size="sm">
        <p className="text-amber-800 mb-6">Delete this sale record? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
