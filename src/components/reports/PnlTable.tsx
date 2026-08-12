'use client'

import type { PnlReport } from '@/types'
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

interface PnlTableProps {
  from: string
  to: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  data?: PnlReport
  loading?: boolean
}

export default function PnlTable({ from, to, onFromChange, onToChange, data, loading }: PnlTableProps) {
  return (
    <div className="space-y-4">
      {/* Date range picker */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          
         <div className="w-44">
            <DatePicker
              label="To"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
<div className="w-44">
            <DatePicker
              label="To"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Line Chart */}
      {data && data.dailyBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-amber-900 mb-4">P&amp;L Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={data.dailyBreakdown.map((row) => ({
                date: new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                Revenue: Number(row.revenue),
                Costs: Number(row.costs),
                Profit: Number(row.profit),
              }))}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#92400e' }} />
              <YAxis tick={{ fontSize: 11, fill: '#92400e' }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Costs" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Profit" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="h-40 bg-amber-50 rounded-xl animate-pulse" />
      ) : data ? (
        <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Costs</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-50">
              {data.dailyBreakdown.map((row) => (
                <tr key={row.date} className="hover:bg-amber-50/50">
                  <td className="px-4 py-3 text-amber-900">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right text-amber-900">{row.revenue}</td>
                  <td className="px-4 py-3 text-right text-amber-900">{row.costs}</td>
                  <td className={`px-4 py-3 text-right font-medium ${Number(row.profit) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {row.profit}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-amber-50 border-t-2 border-amber-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-900">Total</td>
                <td className="px-4 py-3 text-right font-semibold text-amber-900">{data.totalRevenue}</td>
                <td className="px-4 py-3 text-right font-semibold text-amber-900">{data.totalCosts}</td>
                <td className={`px-4 py-3 text-right font-bold ${Number(data.totalProfit) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {data.totalProfit}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-amber-400 text-center py-8">Select a date range to view the P&amp;L report.</p>
      )}
    </div>
  )
}
