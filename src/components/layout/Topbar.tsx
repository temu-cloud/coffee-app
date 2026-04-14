'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiBell } from 'react-icons/fi'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/inventory': 'Inventory',
  '/supplies': 'Supplies',
  '/assets': 'Assets',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/prices': 'Prices',
  '/payments': 'Payments',
  '/budgets': 'Budgets',
  '/users': 'Users',
  '/transactions': 'Stock Movement',
  '/reports/pnl': 'P&L Report',
  '/reports/sales-volume': 'Sales Volume',
  '/reports/cost-analysis': 'Cost Analysis',
}

export default function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] ?? 'Damot Coffee'
  const [outOfStockCount, setOutOfStockCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/stock-movements/out-of-stock-count')
        if (res.ok) {
          const data = await res.json()
          setOutOfStockCount(data.count ?? 0)
        }
      } catch { /* silent */ }
    }
    fetchCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchCount, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-amber-100 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left: page title */}
        <div className="pl-10 lg:pl-0">
          <h1 className="text-lg md:text-xl font-bold text-amber-900">{title}</h1>
          <p className="text-xs text-amber-500 hidden sm:block">Coffee Shop Management</p>
        </div>

        {/* Center: bell notification */}
        <button
          onClick={() => router.push('/transactions')}
          className="relative p-2 rounded-full hover:bg-amber-50 transition-colors cursor-pointer"
          aria-label="Stock movement notifications"
        >
          <FiBell className="w-5 h-5 text-amber-700" />
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${outOfStockCount > 0 ? 'bg-red-500' : 'bg-amber-400'}`}>
            {outOfStockCount > 99 ? '99+' : outOfStockCount}
          </span>
        </button>

        {/* Right: logo */}
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Image src="/newlogo.png" alt="Damot Coffee" className="w-5 h-5 object-contain" width={40} height={40} />
          </div>
          <span className="hidden sm:inline text-amber-700">Good day!</span>
        </div>
      </div>
    </header>
  )
}
