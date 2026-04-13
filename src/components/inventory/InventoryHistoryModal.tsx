'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { InventoryItem, InventoryHistory } from '@/types'

interface InventoryHistoryModalProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export default function InventoryHistoryModal({ item, open, onClose }: InventoryHistoryModalProps) {
  const [history, setHistory] = useState<InventoryHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !item) return
    setLoading(true)
    fetch(`/api/inventory/${item.id}/history`)
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [open, item])

  return (
    <Modal open={open} onClose={onClose} title={`History — ${item?.name ?? ''}`} size="lg">
      {loading ? (
        <p className="text-amber-500 text-sm py-4 text-center">Loading history…</p>
      ) : history.length === 0 ? (
        <p className="text-amber-400 text-sm py-4 text-center">No addition history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                {['Date', 'Qty Added', 'Unit Cost', 'Total Cost', 'Supplier'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-amber-50/50">
                  <td className="px-4 py-2 text-amber-900">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-amber-900">{row.quantityAdded}</td>
                  <td className="px-4 py-2 text-amber-900">{row.unitCost}</td>
                  <td className="px-4 py-2 text-amber-900">{row.totalCost}</td>
                  <td className="px-4 py-2 text-amber-900">{row.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
