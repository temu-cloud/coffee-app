'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
 

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
}

export default function Topbar() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'Coffee Inventory'

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-amber-100 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="pl-10 lg:pl-0">
          <h1 className="text-lg md:text-xl font-bold text-amber-900">{title}</h1>
          <p className="text-xs text-amber-500 hidden sm:block">Coffee Shop Inventory Management</p>
        </div>

        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center">
            <Image
              src="/d.png"
              alt="Coffee Icon"
              className="w-5 h-5 object-contain"
              width={20}
              height={20}
            />
          </div>
          <span className="hidden sm:inline text-amber-700">Good day!</span>
        </div>
      </div>
    </header>
  )
}
