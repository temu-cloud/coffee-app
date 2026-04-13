'use client'

import { useState } from 'react'
import { useReports } from '@/hooks/useReports'
import UsageChart from '@/components/reports/UsageChart'
import TopProductsList from '@/components/reports/TopProductsList'
import SummaryTable from '@/components/reports/SummaryTable'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import DatePicker from '@/components/ui/DatePicker'  // ← Import DatePicker

function defaultDateRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export default function ReportsPage() {
  const defaults = defaultDateRange()
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [query, setQuery] = useState(defaults)

  const { data, isLoading } = useReports(query)

  function applyFilter() {
    if (from && to) setQuery({ from, to })
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
       
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-44">
            <DatePicker
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="w-44">
            <DatePicker
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <Button onClick={applyFilter} disabled={!from || !to}>Apply</Button>
          <Button
            variant="secondary"
            onClick={() => {
              const d = defaultDateRange()
              setFrom(d.from)
              setTo(d.to)
              setQuery(d)
            }}
          >
            Last 30 Days
          </Button>
        </div>
       

      {/* Usage Chart */}
      <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-amber-900 mb-4">Daily Stock Usage by Product</h2>
        {isLoading ? (
          <Skeleton height="h-64" />
        ) : (
          <UsageChart data={data?.dailyUsage ?? []} />
        )}
      </div>

      {/* Top Products + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-amber-900 mb-4">Most Used Products</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="h-6" />
              ))}
            </div>
          ) : (
            <TopProductsList products={data?.topProducts ?? []} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-amber-900 mb-4">Summary</h2>
          <SummaryTable data={data?.summary ?? []} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}