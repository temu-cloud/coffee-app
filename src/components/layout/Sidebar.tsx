'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'
import { FiBarChart2, FiBox, FiBriefcase, FiCoffee, FiCreditCard, FiFileText, FiHardDrive, FiHome, FiLogOut, FiMenu, FiPackage, FiShoppingCart, FiTag, FiTrendingDown, FiTrendingUp, FiUsers, FiX } from 'react-icons/fi'
import { useState } from 'react'

type NavItem = { href: string; label: string; icon: React.ReactNode }

const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
  { href: '/inventory', label: 'Inventory', icon: <FiPackage className="w-5 h-5" /> },
  { href: '/supplies', label: 'Supplies', icon: <FiBox className="w-5 h-5" /> },
  { href: '/assets', label: 'Assets', icon: <FiHardDrive className="w-5 h-5" /> },
  { href: '/sales', label: 'Sales', icon: <FiShoppingCart className="w-5 h-5" /> },
  { href: '/expenses', label: 'Expenses', icon: <FiFileText className="w-5 h-5" /> },
  { href: '/prices', label: 'Prices', icon: <FiTag className="w-5 h-5" /> },
  { href: '/payments', label: 'Payments', icon: <FiCreditCard className="w-5 h-5" /> },
  { href: '/reports/pnl', label: 'P&L Report', icon: <FiTrendingUp className="w-5 h-5" /> },
  { href: '/reports/sales-volume', label: 'Sales Volume', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/reports/cost-analysis', label: 'Cost Analysis', icon: <FiTrendingDown className="w-5 h-5" /> },
  { href: '/budgets', label: 'Budgets', icon: <FiBriefcase className="w-5 h-5" /> },
  { href: '/users', label: 'Users', icon: <FiUsers className="w-5 h-5" /> },
]
const ADMIN_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
  { href: '/sales', label: 'Sales', icon: <FiShoppingCart className="w-5 h-5" /> },
  { href: '/expenses', label: 'Expenses', icon: <FiFileText className="w-5 h-5" /> },
]

const FINANCE_MANAGER_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/prices', label: 'Prices', icon: <FiTag className="w-5 h-5" /> },
  { href: '/payments', label: 'Payments', icon: <FiCreditCard className="w-5 h-5" /> },
  { href: '/reports/pnl', label: 'P&L Report', icon: <FiTrendingUp className="w-5 h-5" /> },
  { href: '/reports/sales-volume', label: 'Sales Volume', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/reports/cost-analysis', label: 'Cost Analysis', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/budgets', label: 'Budgets', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/inventory', label: 'Inventory', icon: <FiPackage className="w-5 h-5" /> },
  { href: '/supplies', label: 'Supplies', icon: <FiBox className="w-5 h-5" /> },
  { href: '/assets', label: 'Assets', icon: <FiHardDrive className="w-5 h-5" /> },
]

const FACILITY_MANAGER_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FiBarChart2 className="w-5 h-5" /> },
  { href: '/inventory', label: 'Inventory', icon: <FiPackage className="w-5 h-5" /> },
  { href: '/supplies', label: 'Supplies', icon: <FiBox className="w-5 h-5" /> },
  { href: '/assets', label: 'Assets', icon: <FiHardDrive className="w-5 h-5" /> },
]

const NO_ROLE_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
]

const ROLE_BADGE: Record<string, string> = {
  NO_ROLE: 'bg-amber-800 text-amber-300',
  SUPER_ADMIN: 'bg-amber-600 text-white',
  ADMIN: 'bg-blue-600 text-white',
  FINANCE_MANAGER: 'bg-green-700 text-white',
  FACILITY_MANAGER: 'bg-purple-700 text-white',
}

function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'SUPER_ADMIN': return SUPER_ADMIN_NAV
    case 'ADMIN': return ADMIN_NAV
    case 'FINANCE_MANAGER': return FINANCE_MANAGER_NAV
    case 'FACILITY_MANAGER': return FACILITY_MANAGER_NAV
    case 'NO_ROLE': return NO_ROLE_NAV
    default: return NO_ROLE_NAV
  }
}

interface SidebarProps {
  onClose?: () => void
}

function SidebarContent({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any
  const role: string | undefined = user?.role
  const navItems = getNavItems(role)

  async function handleLogout() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <img
              src="/dd.png"
              alt="Damot Coffee Logo"
              className="w-5 h-5 object-contain"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Damot Coffee</p>
            <p className="text-amber-300 text-xs">Management System</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-amber-300 hover:text-white lg:hidden">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-4 py-4 border-t border-amber-800">
        {session?.user && (
          <div className="mb-3 px-2">
            <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-amber-400 text-xs truncate">{session.user.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[role ?? ''] ?? 'bg-amber-800 text-amber-300'
              }`}>
              {role === 'NO_ROLE' ? 'Pending Role' : (role ?? 'Unknown')}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-800 hover:text-white text-sm transition-colors"
        >
          <FiLogOut className="w-5 h-5" /> Sign out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-amber-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-amber-900 z-50 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 bg-amber-900 flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
