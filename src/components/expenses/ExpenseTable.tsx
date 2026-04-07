'use client'

import Table, { Column } from '@/components/ui/Table'
import type { DailyExpense } from '@/types'

interface ExpenseTableProps {
  expenses: DailyExpense[]
  loading?: boolean
}

export default function ExpenseTable({ expenses, loading }: ExpenseTableProps) {
  const columns: Column<DailyExpense>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'itemName', header: 'Item Name' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitPrice', header: 'Unit Price' },
    { key: 'totalPrice', header: 'Total Price' },
  ]

  return (
    <Table columns={columns} data={expenses} loading={loading} emptyMessage="No expense records found." />
  )
}
