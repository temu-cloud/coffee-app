'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Payment } from '@/types'

interface PaymentFormProps {
  onSubmit: (data: Partial<Payment>) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  date?: string
  payee?: string
  description?: string
  amount?: string
  paymentMethod?: string
}

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Mobile Money', label: 'Mobile Money' },
  { value: 'Check', label: 'Check' },
]

export default function PaymentForm({ onSubmit, loading }: PaymentFormProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [payee, setPayee] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    if (!date) e.date = 'Date is required'
    if (!payee.trim()) e.payee = 'Payee is required'
    if (!description.trim()) e.description = 'Description is required'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Amount must be > 0'
    if (!paymentMethod) e.paymentMethod = 'Payment method is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      date: new Date(date).toISOString(),
      payee: payee.trim(),
      description: description.trim(),
      amount,
      paymentMethod,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} disabled={loading} />
      <Input label="Payee" value={payee} onChange={(e) => setPayee(e.target.value)} error={errors.payee} placeholder="Payee name" disabled={loading} />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} placeholder="Payment description" disabled={loading} />
      <Input label="Amount" type="number" min="0.01" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} disabled={loading} />
      <Select
        label="Payment Method"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        options={PAYMENT_METHODS}
        placeholder="Select method"
        error={errors.paymentMethod}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Add Payment</Button>
      </div>
    </form>
  )
}
