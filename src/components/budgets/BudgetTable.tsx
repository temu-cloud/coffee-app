'use client'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useSession } from '@/lib/auth-client'
import type { Budget } from '@/types'

interface EnrichedBudget extends Budget {
  actualCosts?: string
  utilization?: string
}

interface BudgetTableProps {
  budgets: EnrichedBudget[]
  loading?: boolean
  onEdit: (budget: EnrichedBudget) => void
  onDelete: (budget: EnrichedBudget) => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function BudgetTable({ budgets, loading, onEdit, onDelete }: BudgetTableProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER'

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-amber-50 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (budgets.length === 0) {
    return <p className="text-sm text-amber-400 text-center py-8">No budgets found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-amber-50 border-b border-amber-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Period</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Category</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Allocated</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Actual Costs</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-amber-700 uppercase">Utilization</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Status</th>
            {canManage && <th className="px-4 py-3 text-left text-xs font-semibold text-amber-700 uppercase">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-amber-50">
          {budgets.map((budget) => {
            const utilization = Number(budget.utilization ?? 0)
            const utilizationPct = (utilization * 100).toFixed(1)
            const isOverBudget = utilization > 1

            return (
              <tr key={budget.id} className={`hover:bg-amber-50/50 ${isOverBudget ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3 text-amber-900">
                  {MONTH_NAMES[(budget.periodMonth - 1) % 12]} {budget.periodYear}
                </td>
                <td className="px-4 py-3 text-amber-900">{budget.category}</td>
                <td className="px-4 py-3 text-right text-amber-900">{budget.allocatedAmount}</td>
                <td className="px-4 py-3 text-right text-amber-900">{budget.actualCosts ?? '—'}</td>
                <td className="px-4 py-3 text-right text-amber-900">{utilizationPct}%</td>
                <td className="px-4 py-3">
                  {isOverBudget ? (
                    <Badge variant="danger">Over Budget</Badge>
                  ) : utilization >= 0.9 ? (
                    <Badge variant="warning">Near Limit</Badge>
                  ) : (
                    <Badge variant="success">On Track</Badge>
                  )}
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(budget)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(budget)}>Delete</Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
