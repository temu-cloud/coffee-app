'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { PriceHistory } from '@/types'

interface PriceFormProps {
  onSubmit: (data: Partial<PriceHistory>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  itemName?: string
  price?: string
  effectiveDate?: string
}

export default function PriceForm({ onSubmit, loading }: PriceFormProps) {
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    if (!itemName.trim()) e.itemName = 'Item name is required'
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Price must be > 0'
    if (!effectiveDate) e.effectiveDate = 'Effective date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      itemName: itemName.trim(),
      price,
      effectiveDate: new Date(effectiveDate).toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Item Name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        error={errors.itemName}
        placeholder="e.g. Espresso, Latte, Cup of Coffee..."
        disabled={loading}
        autoComplete="off"
      />
      <Input
        label="Price (per unit)"
        type="number"
        min="0.01"
        step="any"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={errors.price}
        placeholder="e.g. 45.00"
        disabled={loading}
      />
      <Input
        label="Effective Date"
        type="date"
        value={effectiveDate}
        onChange={(e) => setEffectiveDate(e.target.value)}
        error={errors.effectiveDate}
        disabled={loading}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Set Price</Button>
      </div>
    </form>
  )
}
