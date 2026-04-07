'use client'

import { useState } from 'react'
import { useCostAnalysisReport } from '@/hooks/useReports'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'

export default function CostAnalysisReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useCostAnalysisReport({ from, to })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">Cost Analysis Report</h2>
        <p className="text-sm text-amber-500">Costs grouped by category</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-44">
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-44">
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <Skeleton height="h-40" />
      ) : data && data.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Total Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-50">
              {data.map((row) => (
                <tr key={row.category} className="hover:bg-amber-50/50">
                  <td className="px-4 py-3 text-amber-900 font-medium">{row.category}</td>
                  <td className="px-4 py-3 text-right text-amber-900">{row.totalCost}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-amber-50 border-t-2 border-amber-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-900">Total</td>
                <td className="px-4 py-3 text-right font-bold text-amber-900">
                  {data.reduce((sum, r) => sum + Number(r.totalCost), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-amber-400 text-center py-8">Select a date range to view cost analysis.</p>
      )}
    </div>
  )
}
