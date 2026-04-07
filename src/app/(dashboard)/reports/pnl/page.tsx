'use client'

import { useState } from 'react'
import { usePnlReport } from '@/hooks/useReports'
import PnlTable from '@/components/reports/PnlTable'

export default function PnlReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = usePnlReport({ from, to })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">Profit & Loss Report</h2>
        <p className="text-sm text-amber-500">Daily revenue, costs, and profit breakdown</p>
      </div>
      <PnlTable
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        data={data}
        loading={isLoading}
      />
    </div>
  )
}
