'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useInventoryItems } from '@/hooks/useInventory'
import type { PriceHistory } from '@/types'

interface PriceFormProps {
  onSubmit: (data: Partial<PriceHistory>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  inventoryItemId?: string
  price?: string
  effectiveDate?: string
}

export default function PriceForm({ onSubmit, loading }: PriceFormProps) {
  const [inventoryItemId, setInventoryItemId] = useState('')
  const [price, setPrice] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [errors, setErrors] = useState<FormErrors>({})

  const { data: inventoryData } = useInventoryItems({ category: 'FINISHED_GOOD', pageSize: 100 })
  const finishedGoods = inventoryData?.data ?? []

  function validate(): boolean {
    const e: FormErrors = {}
    if (!inventoryItemId) e.inventoryItemId = 'Please select an item'
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Price must be > 0'
    if (!effectiveDate) e.effectiveDate = 'Effective date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      inventoryItemId,
      price,
      effectiveDate: new Date(effectiveDate).toISOString(),
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
      <Input label="Price" type="number" min="0.01" step="any" value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} disabled={loading} />
      <Input label="Effective Date" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} error={errors.effectiveDate} disabled={loading} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Set Price</Button>
      </div>
    </form>
  )
}
