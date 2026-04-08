'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface UsageChartProps {
  data: { date: string; quantity: number }[]
}

export default function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-amber-400 text-sm">
        No usage data for the past 7 days.
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#92400e' }} />
        <YAxis tick={{ fontSize: 11, fill: '#92400e' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 8 }}
          labelStyle={{ color: '#92400e', fontWeight: 600 }}
        />
        <Bar dataKey="quantity" fill="#92400e" radius={[4, 4, 0, 0]} name="Sales Volume" />
      </BarChart>
    </ResponsiveContainer>
  )
}
