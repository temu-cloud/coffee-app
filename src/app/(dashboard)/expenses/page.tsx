'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useExpenses, useCreateExpense } from '@/hooks/useExpenses'
import ExpenseFilters from '@/components/expenses/ExpenseFilters'
import ExpenseTable from '@/components/expenses/ExpenseTable'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { DailyExpense } from '@/types'

export default function ExpensesPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canCreate = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const { data, isLoading } = useExpenses({ from: from || undefined, to: to || undefined, page: 1, pageSize: 50 })
  const createMutation = useCreateExpense()

  const handleFilter = useCallback((f: string, t: string) => {
    setFrom(f)
    setTo(t)
  }, [])

  async function handleFormSubmit(data: Partial<DailyExpense>) {
    try {
      await createMutation.mutateAsync(data)
      toast('Expense added successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Expenses</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} records total</p>
        </div>
        {canCreate && <Button onClick={() => setFormOpen(true)}>+ Add Expense</Button>}
      </div>

      <ExpenseFilters onFilter={handleFilter} />

      <ExpenseTable expenses={data?.data ?? []} loading={isLoading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleFormSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  )
}
