'use client'

import { useState } from 'react'
import { usePrices, useCreatePrice } from '@/hooks/usePrices'
import PriceForm from '@/components/prices/PriceForm'
import PriceTable from '@/components/prices/PriceTable'
import PriceHistoryList from '@/components/prices/PriceHistoryList'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useInventoryItems } from '@/hooks/useInventory'
import type { PriceHistory } from '@/types'

export default function PricesPage() {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const { data: prices, isLoading } = usePrices()
  const { data: inventoryData } = useInventoryItems({ category: 'FINISHED_GOOD', pageSize: 100 })
  const createMutation = useCreatePrice()

  const finishedGoods = inventoryData?.data ?? []

  // Build a map of itemId -> latest price
  const latestPriceMap = new Map<string, PriceHistory>()
  if (Array.isArray(prices)) {
    for (const p of prices) {
      const existing = latestPriceMap.get(p.inventoryItemId)
      if (!existing || p.effectiveDate > existing.effectiveDate) {
        latestPriceMap.set(p.inventoryItemId, p)
      }
    }
  }

  const currentPrices = Array.from(latestPriceMap.values()).map((p) => ({
    ...p,
    inventoryItem: finishedGoods.find((item) => item.id === p.inventoryItemId),
  }))

  const selectedItem = selectedItemId
    ? finishedGoods.find((item) => item.id === selectedItemId)
    : null

  async function handleFormSubmit(data: Partial<PriceHistory>) {
    try {
      await createMutation.mutateAsync(data)
      toast('Price set successfully')
      setFormOpen(false)
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast(err.message ?? 'Something went wrong', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Prices</h2>
          <p className="text-sm text-amber-500">Current prices per finished good</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Set Price</Button>
      </div>

      <PriceTable prices={currentPrices} loading={isLoading} onSelectItem={setSelectedItemId} />

      {selectedItemId && (
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-amber-900">Price History</h3>
            <button onClick={() => setSelectedItemId(null)} className="text-amber-400 hover:text-amber-700 text-sm">✕ Close</button>
          </div>
          <PriceHistoryList inventoryItemId={selectedItemId} itemName={selectedItem?.name} />
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Set Price">
        <PriceForm onSubmit={handleFormSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  )
}
