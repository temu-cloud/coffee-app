'use client'

import { useState } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Product } from '@/types'
import type { CreateTransactionInput } from '@/services/transactions'

interface TransactionFormProps {
  products: Product[]
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  loading?: boolean
  allowStockIn?: boolean
  allowStockOut?: boolean
}

interface FormErrors {
  productId?: string
  type?: string
  quantity?: string
  note?: string
}

export default function TransactionForm({ products, onSubmit, loading, allowStockIn = true, allowStockOut = true }: TransactionFormProps) {
  const [productId, setProductId] = useState('')
  const defaultType = allowStockIn ? 'STOCK_IN' : 'STOCK_OUT'
  const [type, setType] = useState<'STOCK_IN' | 'STOCK_OUT'>(defaultType)
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const selectedProduct = products.find((p) => p.id === productId)

  function validate(): boolean {
    const e: FormErrors = {}
    if (!productId) e.productId = 'Select a product'
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      e.quantity = 'Must be a positive whole number'
    }
    if (type === 'STOCK_OUT' && !note.trim()) {
      e.note = 'Note is required for stock-out'
    }
    if (
      type === 'STOCK_OUT' &&
      selectedProduct &&
      Number(quantity) > selectedProduct.stock
    ) {
      e.quantity = `Insufficient stock (available: ${selectedProduct.stock})`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ productId, type, quantity: Number(quantity), note: note || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Product"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        options={products.map((p) => ({
          value: p.id,
          label: `${p.name} (${p.stock} ${p.unit})`,
        }))}
        placeholder="Select a product"
        error={errors.productId}
      />

      <Select
        label="Transaction Type"
        value={type}
        onChange={(e) => setType(e.target.value as 'STOCK_IN' | 'STOCK_OUT')}
        options={[
          ...(allowStockIn ? [{ value: 'STOCK_IN', label: '↑ Stock In (Restock)' }] : []),
          ...(allowStockOut ? [{ value: 'STOCK_OUT', label: '↓ Stock Out (Usage)' }] : []),
        ]}
      />

      <Input
        label="Quantity"
        type="number"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        error={errors.quantity}
        placeholder="Enter quantity"
        disabled={loading}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-amber-900">
          Note {type === 'STOCK_OUT' && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === 'STOCK_OUT' ? 'Reason for stock out (required)' : 'Optional note'}
          rows={2}
          disabled={loading}
          className={`px-3 py-2 rounded-lg border text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
            errors.note ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white'
          }`}
        />
        {errors.note && <p className="text-xs text-red-600">{errors.note}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Record Transaction
        </Button>
      </div>
    </form>
  )
}
