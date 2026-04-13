'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'  // ← Import custom Select
import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'
import DatePicker from '@/components/ui/DatePicker'
import type { DailySale, PriceHistory } from '@/types'

interface SaleFormProps {
  sale?: DailySale | null
  onSubmit: (data: Partial<DailySale>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  itemName?: string
  date?: string
  quantitySold?: string
}

export default function SaleForm({ sale, onSubmit, loading }: SaleFormProps) {
  const [selectedPriceId, setSelectedPriceId] = useState(sale?.priceHistoryId ?? '')
  const [date, setDate] = useState(sale?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [quantitySold, setQuantitySold] = useState(sale?.quantitySold ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch distinct latest price per item name
  const { data: pricedItems = [] } = useQuery<PriceHistory[]>({
    queryKey: ['prices', 'distinct'],
    queryFn: () => api.get<PriceHistory[]>('/prices', { params: { distinct: true } }).then((r) => r.data),
    staleTime: 30_000,
  })

  const selected = pricedItems.find((p) => p.id === selectedPriceId)
  const unitPrice = selected?.price ?? null
  const unitCost = selected?.unitCost ?? null

  const qty = Number(quantitySold)
  const saleTotal =
    unitPrice && qty > 0 ? (Number(unitPrice) * qty).toFixed(2) : ''
  const totalCost =
    unitCost != null && qty > 0 ? (Number(unitCost) * qty).toFixed(2) : ''
  const profit =
    saleTotal && totalCost ? (Number(saleTotal) - Number(totalCost)).toFixed(2) : ''

  // Convert pricedItems to options format for Select component
  const itemOptions = pricedItems.map((p) => ({
    value: p.id,
    label: `${p.itemName} — ${p.price}/unit`
  }))

  function validate(): boolean {
    const e: FormErrors = {}
    if (!selectedPriceId) e.itemName = 'Please select an item'
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
      itemName: selected!.itemName,
      unitPrice: String(unitPrice),
      unitCost: unitCost != null ? String(unitCost) : '0',
      date: new Date(date).toISOString(),
      quantitySold,
      saleTotal,
      totalCost: totalCost || '0',
      profit: profit || '0',
      priceHistoryId: selectedPriceId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Item selector */}
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Item</label>
        {pricedItems.length === 0 ? (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
            No items have a price set yet. Go to Prices to add one first.
          </div>
        ) : (
          <Select
            value={selectedPriceId}
            onChange={(e) => { 
              setSelectedPriceId(e.target.value)
              setQuantitySold('')
            }}
            options={itemOptions}
            placeholder="— Select an item —"
            disabled={loading}
            error={errors.itemName}
          />
        )}
      </div>

      {/* Cost per unit (read-only) */}
      {selected && (
        unitCost != null && Number(unitCost) > 0 ? (
          <Input
            label="Cost per unit"
            value={Number(unitCost).toFixed(4)}
            readOnly
            className="bg-amber-50 cursor-not-allowed"
          />
        ) : (
          <div className="px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
            ⚠ No unit cost recorded for this item — profit will be calculated as 0.
          </div>
        )
      )}

      <DatePicker
        label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        disabled={loading}
      />

      <Input
        label="Quantity Sold"
        type="number"
        min="0.01"
        step="any"
        value={quantitySold}
        onChange={(e) => setQuantitySold(e.target.value)}
        error={errors.quantitySold}
        disabled={loading}
      />

      {/* Summary */}
      {saleTotal && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 px-3 py-2 space-y-1">
          <div>Sale Total: <strong>{saleTotal}</strong></div>
          {totalCost && <div>Total Cost: <strong>{totalCost}</strong></div>}
          {profit && <div>Profit: <strong>{profit}</strong></div>}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{sale ? 'Save Changes' : 'Record Sale'}</Button>
      </div>
    </form>
  )
}