import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import type { Transaction } from '@/types'

interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
}

const columns: Column<Transaction>[] = [
  {
    key: 'product',
    header: 'Product',
    render: (row) => row.product?.name ?? '—',
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.type === 'STOCK_IN' ? 'success' : 'danger'}>
        {row.type === 'STOCK_IN' ? '↑ Stock In' : '↓ Stock Out'}
      </Badge>
    ),
  },
  { key: 'quantity', header: 'Qty' },
  {
    key: 'note',
    header: 'Note',
    render: (row) => <span className="text-amber-600 text-xs">{row.note ?? '—'}</span>,
  },
  {
    key: 'user',
    header: 'Staff',
    render: (row) => row.user?.name ?? '—',
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (row) =>
      new Date(row.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
]

export default function TransactionTable({ transactions, loading }: TransactionTableProps) {
  return (
    <Table
      columns={columns}
      data={transactions}
      loading={loading}
      emptyMessage="No transactions found."
    />
  )
}
