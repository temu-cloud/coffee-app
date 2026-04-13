'use client'

import { useState } from 'react'
import { useSalesVolumeReport } from '@/hooks/useReports'
import UsageChart from '@/components/reports/UsageChart'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import DatePicker from '@/components/ui/DatePicker'

export default function SalesVolumeReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useSalesVolumeReport({ from, to })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">Sales Volume Report</h2>
        <p className="text-sm text-amber-500">Quantity sold per item over time</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-44">
          <DatePicker label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-44">
          <DatePicker label="To" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
        <h3 className="text-base font-semibold text-amber-900 mb-4">Sales Volume Chart</h3>
        {isLoading ? (
          <Skeleton height="h-64" />
        ) : (
          <UsageChart data={data ?? []} />
        )}
      </div>
    </div>
  )
}
