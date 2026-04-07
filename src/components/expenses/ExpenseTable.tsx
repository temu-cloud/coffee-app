'use client'

import Table, { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { DailyExpense } from '@/types'

interface ExpenseTableProps {
  expenses: DailyExpense[]
  loading?: boolean
  onDelete: (expense: DailyExpense) => void
}

export default function ExpenseTable({ expenses, loading, onDelete }: ExpenseTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'ADMIN'

  const columns: Column<DailyExpense>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item Name' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'totalPrice', header: 'Total Price' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        canManage ? (
          <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={expenses} loading={loading} emptyMessage="No expense records found." />
  )
}
