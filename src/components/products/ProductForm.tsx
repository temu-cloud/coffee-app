'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import type { Product } from '@/types'

const CATEGORIES = [
  'Coffee', 'Dairy', 'Sweeteners', 'Syrups', 'Packaging', 'Equipment', 'Ingredients', 'Other',
]

interface ProductFormProps {
  product?: Product | null
  onSubmit: (formData: FormData) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  name?: string
  category?: string
  unit?: string
  lowStockThreshold?: string
}

export default function ProductForm({ product, onSubmit, loading }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [threshold, setThreshold] = useState(String(product?.lowStockThreshold ?? 10))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!category) e.category = 'Category is required'
    if (!unit.trim()) e.unit = 'Unit is required'
    if (!threshold || isNaN(Number(threshold)) || Number(threshold) < 0) {
      e.lowStockThreshold = 'Must be a non-negative number'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('category', category)
    fd.append('unit', unit.trim())
    fd.append('lowStockThreshold', threshold)
    if (imageFile) fd.append('image', imageFile)

    await onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center">
        <ImageUpload
          currentUrl={product?.imageUrl}
          onUpload={(file) => setImageFile(file)}
          disabled={loading}
        />
      </div>

      <Input
        label="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Arabica Coffee Beans"
        disabled={loading}
      />

      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        placeholder="Select a category"
        error={errors.category}
      />

      <Input
        label="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        error={errors.unit}
        placeholder="e.g. kg, liters, pcs"
        disabled={loading}
      />

      <Input
        label="Low Stock Threshold"
        type="number"
        min="0"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        error={errors.lowStockThreshold}
        placeholder="10"
        disabled={loading}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}
