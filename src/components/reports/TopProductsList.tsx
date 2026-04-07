import type { TopProduct } from '@/services/reports'

interface TopProductsListProps {
  products: TopProduct[]
}

export default function TopProductsList({ products }: TopProductsListProps) {
  if (!products || products.length === 0) {
    return <p className="text-amber-400 text-sm text-center py-6">No data for this period.</p>
  }

  const max = products[0]?.totalStockOut || 1

  return (
    <ol className="space-y-3">
      {products.map((p, i) => (
        <li key={p.productId} className="flex items-center gap-3">
          <span className="text-amber-400 font-bold text-sm w-5 text-right">{i + 1}</span>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-amber-900">{p.productName}</span>
              <span className="text-amber-600">{p.totalStockOut} units</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-700 rounded-full transition-all"
                style={{ width: `${(p.totalStockOut / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
