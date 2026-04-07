'use client'

import { useCallback, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { usePayments, useCreatePayment, useExecutePayment } from '@/hooks/usePayments'
import PaymentFilters from '@/components/payments/PaymentFilters'
import PaymentTable from '@/components/payments/PaymentTable'
import PaymentForm from '@/components/payments/PaymentForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Payment } from '@/types'

export default function PaymentsPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const role = session?.user?.role
  const canCreate = role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER'

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [executed, setExecuted] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [executeTarget, setExecuteTarget] = useState<Payment | null>(null)

  const executedParam = executed === 'true' ? true : executed === 'false' ? false : undefined
  const { data, isLoading } = usePayments({ from: from || undefined, to: to || undefined, executed: executedParam, page: 1, pageSize: 50 })
  const createMutation = useCreatePayment()
  const executeMutation = useExecutePayment()

  const handleFilter = useCallback((f: string, t: string, e: string) => {
    setFrom(f)
    setTo(t)
    setExecuted(e)
  }, [])

  async function handleFormSubmit(data: Partial<Payment>) {
    try {
      await createMutation.mutateAsync(data)
      toast('Payment added successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  async function handleExecute() {
    if (!executeTarget) return
    try {
      await executeMutation.mutateAsync(executeTarget.id)
      toast('Payment executed successfully')
      setExecuteTarget(null)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Could not execute payment', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Payments</h2>
          <p className="text-sm text-amber-500">{data?.total ?? 0} records total</p>
        </div>
        {canCreate && <Button onClick={() => setFormOpen(true)}>+ Add Payment</Button>}
      </div>

      <PaymentFilters onFilter={handleFilter} />

      <PaymentTable payments={data?.data ?? []} loading={isLoading} onExecute={setExecuteTarget} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add Payment">
        <PaymentForm onSubmit={handleFormSubmit} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!executeTarget} onClose={() => setExecuteTarget(null)} title="Execute Payment" size="sm">
        <p className="text-amber-800 mb-6">
          Execute payment of <strong>{executeTarget?.amount}</strong> to <strong>{executeTarget?.payee}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setExecuteTarget(null)}>Cancel</Button>
          <Button loading={executeMutation.isPending} onClick={handleExecute}>Confirm Execute</Button>
        </div>
      </Modal>
    </div>
  )
}
