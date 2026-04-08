import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'

interface LowStockProduct {
  id: string
  name: string
  stock: number
  lowStockThreshold: number
}

interface LowStockTableProps {
  products: LowStockProduct[]
  loading?: boolean
}

const columns: Column<LowStockProduct>[] = [
  { key: 'name', header: 'Product' },
  {
    key: 'stock',
    header: 'Current Stock',
    render: (row) => (
      <Badge variant="danger">{row.stock}</Badge>
    ),
  },
  { key: 'lowStockThreshold', header: 'Min. Threshold' },
  {
    key: 'gap',
    header: 'Shortage',
    render: (row) => (
      <span className="text-red-600 font-medium">
        -{row.lowStockThreshold - row.stock}
      </span>
    ),
  },
]

export default function LowStockTable({ products, loading }: LowStockTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton height="h-10" />
        <Skeleton height="h-10" count={3} />
      </div>
    )
  }

  return (
    <Table
      columns={columns}
      data={products}
      emptyMessage="No low stock products. All good! "
    />
  )
}
