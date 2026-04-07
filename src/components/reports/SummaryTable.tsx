import Table, { Column } from '@/components/ui/Table'
import type { SummaryEntry } from '@/services/reports'

interface SummaryTableProps {
  data: SummaryEntry[]
  loading?: boolean
}

const columns: Column<SummaryEntry>[] = [
  { key: 'productName', header: 'Product' },
  {
    key: 'totalStockIn',
    header: 'Stock In',
    render: (row) => <span className="text-green-700 font-medium">+{row.totalStockIn}</span>,
  },
  {
    key: 'totalStockOut',
    header: 'Stock Out',
    render: (row) => <span className="text-red-600 font-medium">-{row.totalStockOut}</span>,
  },
  {
    key: 'netChange',
    header: 'Net Change',
    render: (row) => (
      <span className={row.netChange >= 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
        {row.netChange >= 0 ? '+' : ''}{row.netChange}
      </span>
    ),
  },
]

export default function SummaryTable({ data, loading }: SummaryTableProps) {
  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage="No data for the selected period."
    />
  )
}
