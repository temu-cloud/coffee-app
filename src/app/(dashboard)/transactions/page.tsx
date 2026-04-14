'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { StockMovement } from '@/types'

export default function TransactionsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [editItem, setEditItem] = useState<StockMovement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StockMovement | null>(null)
  const [editAdded, setEditAdded] = useState('')
  const [editSold, setEditSold] = useState('')

  const { data: movements = [], isLoading } = useQuery<StockMovement[]>({
    queryKey: ['stock-movements'],
    queryFn: () => api.get<StockMovement[]>('/stock-movements').then((r) => r.data),
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantityAdded, quantitySold }: { id: string; quantityAdded: string; quantitySold: string }) =>
      api.put(`/stock-movements/${id}`, { quantityAdded: Number(quantityAdded), quantitySold: Number(quantitySold) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-movements'] }); setEditItem(null); toast('Updated') },
    onError: () => toast('Update failed', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/stock-movements/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-movements'] }); setDeleteTarget(null); toast('Deleted') },
    onError: () => toast('Delete failed', 'error'),
  })

  function openEdit(row: StockMovement) {
    setEditItem(row)
    setEditAdded(row.quantityAdded)
    setEditSold(row.quantitySold)
  }

  const columns: Column<StockMovement>[] = [
    {
      key: 'itemName',
      header: 'Item Name',
      render: (row) => (
        <span className="font-medium capitalize">{row.itemName}</span>
      ),
    },
    {
      key: 'quantityAdded',
      header: 'Qty Added',
      render: (row) => Number(row.quantityAdded).toFixed(3),
    },
    {
      key: 'quantitySold',
      header: 'Qty Sold',
      render: (row) => Number(row.quantitySold).toFixed(3),
    },
    {
      key: 'quantityRemaining',
      header: 'Qty Remaining',
      render: (row) => {
        const rem = Number(row.quantityRemaining)
        return (
          <span className={rem <= 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-medium'}>
            {rem.toFixed(3)}
            {rem <= 0 && ' ⚠ Out of stock'}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">Stock Movement</h2>
        <p className="text-sm text-amber-500">Live inventory ledger — quantities added vs sold</p>
      </div>

      <Table
        columns={columns}
        data={movements}
        loading={isLoading}
        emptyMessage="No stock movement records yet."
      />

      {/* Edit modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Edit — ${editItem?.itemName}`} size="sm">
        <div className="space-y-4">
          <Input
            label="Qty Added"
            type="number"
            min="0"
            step="any"
            value={editAdded}
            onChange={(e) => setEditAdded(e.target.value)}
          />
          <Input
            label="Qty Sold"
            type="number"
            min="0"
            step="any"
            value={editSold}
            onChange={(e) => setEditSold(e.target.value)}
          />
          <p className="text-sm text-amber-600">
            Remaining: <strong>{(Number(editAdded || 0) - Number(editSold || 0)).toFixed(3)}</strong>
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button
              loading={updateMutation.isPending}
              onClick={() => editItem && updateMutation.mutate({ id: editItem.id, quantityAdded: editAdded, quantitySold: editSold })}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Record" size="sm">
        <p className="text-amber-800 mb-6">
          Delete stock movement for <strong>{deleteTarget?.itemName}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
