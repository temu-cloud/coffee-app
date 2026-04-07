'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Budget } from '@/types'

interface BudgetFormProps {
  budget?: Budget | null
  onSubmit: (data: Partial<Budget>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  periodMonth?: string
  periodYear?: string
  category?: string
  allocatedAmount?: string
}

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

export default function BudgetForm({ budget, onSubmit, loading }: BudgetFormProps) {
  const now = new Date()
  const [periodMonth, setPeriodMonth] = useState(String(budget?.periodMonth ?? now.getMonth() + 1))
  const [periodYear, setPeriodYear] = useState(String(budget?.periodYear ?? now.getFullYear()))
  const [category, setCategory] = useState(budget?.category ?? '')
  const [allocatedAmount, setAllocatedAmount] = useState(budget?.allocatedAmount ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    const month = Number(periodMonth)
    if (!periodMonth || isNaN(month) || month < 1 || month > 12) e.periodMonth = 'Month must be 1–12'
    const year = Number(periodYear)
    if (!periodYear || isNaN(year) || year < 2000) e.periodYear = 'Valid year required'
    if (!category.trim()) e.category = 'Category is required'
    if (!allocatedAmount || isNaN(Number(allocatedAmount)) || Number(allocatedAmount) <= 0)
      e.allocatedAmount = 'Amount must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      periodMonth: Number(periodMonth),
      periodYear: Number(periodYear),
      category: category.trim(),
      allocatedAmount,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Month"
        value={periodMonth}
        onChange={(e) => setPeriodMonth(e.target.value)}
        options={MONTHS}
        error={errors.periodMonth}
      />
      <Input
        label="Year"
        type="number"
        min="2000"
        step="1"
        value={periodYear}
        onChange={(e) => setPeriodYear(e.target.value)}
        error={errors.periodYear}
        disabled={loading}
      />
      <Input
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
        placeholder="e.g. Supplies, Salaries"
        disabled={loading}
      />
      <Input
        label="Allocated Amount"
        type="number"
        min="0.01"
        step="any"
        value={allocatedAmount}
        onChange={(e) => setAllocatedAmount(e.target.value)}
        error={errors.allocatedAmount}
        disabled={loading}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{budget ? 'Save Changes' : 'Add Budget'}</Button>
      </div>
    </form>
  )
}
