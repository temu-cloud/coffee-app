'use client'

import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { Payment } from '@/types'

interface PaymentTableProps {
  payments: Payment[]
  loading?: boolean
  onExecute: (payment: Payment) => void
}

export default function PaymentTable({ payments, loading, onExecute }: PaymentTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canExecute = role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER'

  const columns: Column<Payment>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'payee', header: 'Payee' },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount' },
    { key: 'paymentMethod', header: 'Method' },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.executedAt ? (
          <Badge variant="success">Executed</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        ),
    },
    {
      key: 'executedAt',
      header: 'Executed At',
      render: (row) => row.executedAt ? new Date(row.executedAt).toLocaleString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        !row.executedAt && canExecute ? (
          <Button size="sm" variant="primary" onClick={() => onExecute(row)}>Execute</Button>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
  )
}
