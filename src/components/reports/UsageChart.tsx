'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyUsageEntry } from '@/services/reports'
import type { SalesVolumeReport } from '@/types'

// Legacy usage entry format
type LegacyEntry = DailyUsageEntry

// New sales-volume format
type SalesVolumeEntry = { date: string; itemName: string; quantitySold: string }

interface UsageChartProps {
  data: LegacyEntry[] | SalesVolumeReport
}

const COLORS = ['#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']

function isSalesVolumeEntry(entry: LegacyEntry | SalesVolumeEntry): entry is SalesVolumeEntry {
  return 'itemName' in entry && 'quantitySold' in entry
}

export default function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-amber-400 text-sm">
        No usage data for the selected period.
      </div>
    )
  }

  // Pivot: date → { name: qty }
  const dateMap: Record<string, Record<string, number>> = {}
  const names = new Set<string>()

  for (const entry of data) {
    if (isSalesVolumeEntry(entry)) {
      const key = entry.date.slice(0, 10)
      if (!dateMap[key]) dateMap[key] = {}
      dateMap[key][entry.itemName] = (dateMap[key][entry.itemName] ?? 0) + Number(entry.quantitySold)
      names.add(entry.itemName)
    } else {
      const key = entry.date.slice(0, 10)
      if (!dateMap[key]) dateMap[key] = {}
      dateMap[key][entry.productName] = (dateMap[key][entry.productName] ?? 0) + entry.quantity
      names.add(entry.productName)
    }
  }

  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...items,
    }))

  const nameList = Array.from(names).slice(0, 7)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#92400e' }} />
        <YAxis tick={{ fontSize: 11, fill: '#92400e' }} allowDecimals={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {nameList.map((name, i) => (
          <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
