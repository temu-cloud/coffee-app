'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import BudgetForm from '@/components/budgets/BudgetForm'
import BudgetTable from '@/components/budgets/BudgetTable'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Budget } from '@/types'

interface EnrichedBudget extends Budget {
  actualCosts?: string
  utilization?: string
}

export default function BudgetsPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER'

  const [formOpen, setFormOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<EnrichedBudget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EnrichedBudget | null>(null)

  const { data, isLoading } = useBudgets()
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const deleteMutation = useDeleteBudget()

  const budgets: EnrichedBudget[] = Array.isArray(data) ? data : (data as { data?: EnrichedBudget[] })?.data ?? []

  function openAdd() { setEditBudget(null); setFormOpen(true) }
  function openEdit(budget: EnrichedBudget) { setEditBudget(budget); setFormOpen(true) }

  async function handleFormSubmit(data: Partial<Budget>) {
    try {
      if (editBudget) {
        await updateMutation.mutateAsync({ id: editBudget.id, data })
        toast('Budget updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast('Budget added successfully')
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
      toast('Budget deleted')
      setDeleteTarget(null)
    } catch (e: unknown) {
      toast((e as { message?: string }).message ?? 'Could not delete', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Budgets</h2>
          <p className="text-sm text-amber-500">{budgets.length} budget entries</p>
        </div>
        {canManage && <Button onClick={openAdd}>+ Add Budget</Button>}
      </div>
      <BudgetTable budgets={budgets} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editBudget ? 'Edit Budget' : 'Add Budget'}>
        <BudgetForm budget={editBudget} onSubmit={handleFormSubmit} loading={createMutation.isPending || updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Budget" size="sm">
        <p className="text-amber-800 mb-6">Delete budget for <strong>{deleteTarget?.category}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
