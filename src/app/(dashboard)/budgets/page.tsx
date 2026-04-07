'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useBudgets, useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets'
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

  const { data, isLoading } = useBudgets()
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()

  // API returns array directly (not paginated)
  const budgets: EnrichedBudget[] = Array.isArray(data) ? data : (data as { data?: EnrichedBudget[] })?.data ?? []

  function openAdd() {
    setEditBudget(null)
    setFormOpen(true)
  }

  function openEdit(budget: EnrichedBudget) {
    setEditBudget(budget)
    setFormOpen(true)
  }

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
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  const isFormLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Budgets</h2>
          <p className="text-sm text-amber-500">{budgets.length} budget entries</p>
        </div>
        {canManage && <Button onClick={openAdd}>+ Add Budget</Button>}
      </div>

      <BudgetTable budgets={budgets} loading={isLoading} onEdit={openEdit} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editBudget ? 'Edit Budget' : 'Add Budget'}>
        <BudgetForm budget={editBudget} onSubmit={handleFormSubmit} loading={isFormLoading} />
      </Modal>
    </div>
  )
}
