'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useInventoryItems } from '@/hooks/useInventory'
import { usePriceHistory } from '@/hooks/usePrices'
import type { DailySale } from '@/types'

interface SaleFormProps {
  onSubmit: (data: Partial<DailySale>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  inventoryItemId?: string
  date?: string
  quantitySold?: string
}

export default function SaleForm({ onSubmit, loading }: SaleFormProps) {
  const [inventoryItemId, setInventoryItemId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantitySold, setQuantitySold] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const { data: inventoryData } = useInventoryItems({ category: 'FINISHED_GOOD', pageSize: 100 })
  const { data: priceHistory } = usePriceHistory(inventoryItemId)

  // Get the most recent price (first in DESC order)
  const currentPrice = priceHistory && priceHistory.length > 0 ? priceHistory[0].price : null
  const priceHistoryId = priceHistory && priceHistory.length > 0 ? priceHistory[0].id : null

  const saleTotal =
    currentPrice && quantitySold && !isNaN(Number(quantitySold)) && Number(quantitySold) > 0
      ? (Number(currentPrice) * Number(quantitySold)).toFixed(2)
      : ''

  const finishedGoods = inventoryData?.data ?? []

  function validate(): boolean {
    const e: FormErrors = {}
    if (!inventoryItemId) e.inventoryItemId = 'Please select an item'
    if (!date) e.date = 'Date is required'
    if (!quantitySold || isNaN(Number(quantitySold)) || Number(quantitySold) <= 0)
      e.quantitySold = 'Quantity must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      inventoryItemId,
      priceHistoryId: priceHistoryId ?? undefined,
      date: new Date(date).toISOString(),
      quantitySold,
      saleTotal,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Finished Good Item"
        value={inventoryItemId}
        onChange={(e) => setInventoryItemId(e.target.value)}
        options={finishedGoods.map((item) => ({ value: item.id, label: item.name }))}
        placeholder="Select an item"
        error={errors.inventoryItemId}
      />
      {currentPrice && (
        <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Current price: <strong>{currentPrice}</strong> per unit
        </div>
      )}
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
      <Input label="Quantity Sold" type="number" min="0.01" step="any" value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} error={errors.quantitySold} disabled={loading} />
      <Input label="Sale Total (auto-computed)" value={saleTotal} readOnly className="bg-amber-50 cursor-not-allowed" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Record Sale</Button>
      </div>
    </form>
  )
}
