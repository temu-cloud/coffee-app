'use client'

import { useState } from 'react'
import { useCostAnalysisReport } from '@/hooks/useReports'
import Skeleton from '@/components/ui/Skeleton'
import DatePicker from '@/components/ui/DatePicker'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#92400e', '#b45309', '#d97706', '#10b981', '#6366f1', '#ef4444']

export default function CostAnalysisReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useCostAnalysisReport({ from, to })

  const categories = data?.daily?.length
    ? Array.from(new Set(data.daily.flatMap((row) => Object.keys(row).filter((k) => k !== 'date'))))
    : []

  const chartData = data?.daily?.map((row) => ({
    ...row,
    date: new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) ?? []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">Cost Analysis Report</h2>
        <p className="text-sm text-amber-500">Costs grouped by category over time</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-44">
          <DatePicker label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-44">
          <DatePicker label="To" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <Skeleton height="h-64" />
      ) : data ? (
        <>
          {/* Line Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
              <h3 className="text-base font-semibold text-amber-900 mb-4">Cost Trend by Category</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#92400e' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#92400e' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {categories.map((cat, i) => (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Table */}
          {data.summary.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 border-b border-amber-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-50">
                  {data.summary.map((row) => (
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
                      {data.summary.reduce((sum, r) => sum + Number(r.totalCost), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-amber-400 text-center py-8">Select a date range to view cost analysis.</p>
      )}
    </div>
  )
}
