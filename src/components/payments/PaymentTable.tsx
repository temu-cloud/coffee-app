'use client'

import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { Payment } from '@/types'

interface PaymentTableProps {
  payments: Payment[]
  loading?: boolean
  onEdit?: (payment: Payment) => void
  onExecute: (payment: Payment) => void
  onDelete: (payment: Payment) => void
}

export default function PaymentTable({ payments, loading, onEdit, onExecute, onDelete }: PaymentTableProps) {
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
        canExecute ? (
          <div className="flex gap-2 flex-wrap">
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>
            )}
            {!row.executedAt && (
              <Button size="sm" variant="primary" onClick={() => onExecute(row)}>Execute</Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>
          </div>
        ) : null,
    },
  ]

  return (
    <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
  )
}
