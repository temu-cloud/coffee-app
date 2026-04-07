'use client'

import { usePriceHistory } from '@/hooks/usePrices'
import Skeleton from '@/components/ui/Skeleton'

interface PriceHistoryListProps {
  inventoryItemId: string
  itemName?: string
}

export default function PriceHistoryList({ inventoryItemId, itemName }: PriceHistoryListProps) {
  const { data: history, isLoading } = usePriceHistory(inventoryItemId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} height="h-10" />)}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return <p className="text-sm text-amber-400 py-4 text-center">No price history for {itemName ?? 'this item'}.</p>
  }

  // Sort by effectiveDate DESC
  const sorted = [...history].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))

  return (
    <div className="space-y-2">
      {itemName && <p className="text-sm font-medium text-amber-800 mb-3">Price history for <strong>{itemName}</strong></p>}
      <div className="overflow-x-auto rounded-xl border border-amber-100">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 border-b border-amber-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Effective Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-amber-50">
            {sorted.map((entry, i) => (
              <tr key={entry.id} className={i === 0 ? 'bg-amber-50/60' : ''}>
                <td className="px-4 py-2 text-amber-900">{new Date(entry.effectiveDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-amber-900 font-medium">{entry.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
