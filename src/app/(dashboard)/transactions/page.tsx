'use client'

import { useCallback, useState } from 'react'
import { useTransactions, useCreateTransaction } from '@/hooks/useTransactions'
import { useProducts } from '@/hooks/useProducts'
import { usePermissions } from '@/hooks/usePermissions'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionForm from '@/components/transactions/TransactionForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { TransactionQuery } from '@/types'

export default function TransactionsPage() {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [filters, setFilters] = useState<Partial<TransactionQuery>>({})

  const { data: txData, isLoading } = useTransactions({ ...filters, pageSize: 50 })
  const { data: productsData } = useProducts({ pageSize: 200 })
  const { data: perms } = usePermissions()
  const createMutation = useCreateTransaction()

  const canRecord = perms?.canAddStock || perms?.canUseStock

  const handleFilter = useCallback((params: Partial<TransactionQuery>) => {
    setFilters(params)
  }, [])

  async function handleSubmit(data: Parameters<typeof createMutation.mutateAsync>[0]) {
    try {
      await createMutation.mutateAsync(data)
      toast('Transaction recorded successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Failed to record transaction', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Transaction History</h2>
          <p className="text-sm text-amber-500">{txData?.total ?? 0} transactions</p>
        </div>
        {canRecord && (
          <Button onClick={() => setFormOpen(true)}>+ Record Transaction</Button>
        )}
      </div>

      <TransactionFilters onFilter={handleFilter} />
      <TransactionTable transactions={txData?.data ?? []} loading={isLoading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Record Transaction">
        <TransactionForm
          products={productsData?.data ?? []}
          onSubmit={handleSubmit}
          loading={createMutation.isPending}
          allowStockIn={perms?.canAddStock ?? true}
          allowStockOut={perms?.canUseStock ?? true}
        />
      </Modal>
    </div>
  )
}
