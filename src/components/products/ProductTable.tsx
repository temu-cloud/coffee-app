'use client'

import Image from 'next/image'
import Table, { Column } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  loading?: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  const { data: session } = useSession()
  const isManager = session?.user?.role === 'MANAGER'
  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (row) =>
        row.imageUrl ? (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image src={row.imageUrl} alt={row.name} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg">☕</div>
        ),
    },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'unit', header: 'Unit' },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <Badge variant={row.stock < row.lowStockThreshold ? 'danger' : 'success'}>
          {row.stock}
        </Badge>
      ),
    },
    { key: 'lowStockThreshold', header: 'Min. Stock' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>
          {isManager && (
            <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>Delete</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={products}
      loading={loading}
      emptyMessage="No products found. Add your first product!"
    />
  )
}
