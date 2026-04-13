'use client'
 
import { FaCoffee,   FaChartLine, FaBoxes, FaUsers,  } from 'react-icons/fa'
 
import { useSession } from '@/lib/auth-client'
import { useDashboard } from '@/hooks/useDashboard'
import StatsCard from '@/components/dashboard/StatsCard'
import LowStockTable from '@/components/dashboard/LowStockTable'
import UsageChart from '@/components/dashboard/UsageChart'
import Skeleton from '@/components/ui/Skeleton'
import { FiAlertTriangle, FiBell, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'
 
export default function DashboardPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useDashboard()
  const role = session?.user?.role

  return (
    <div className="space-y-6">
      {/* SUPER_ADMIN: all stats */}
      {role === 'SUPER_ADMIN' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard title="Today's Revenue" value={data?.todayRevenue != null ? Number(data.todayRevenue) : undefined} icon={<FiDollarSign className="w-5 h-5 text-green-600" />} loading={isLoading} />
            <StatsCard title="Today's Costs" value={data?.todayCosts != null ? Number(data.todayCosts) : undefined} icon={<FiTrendingDown className="w-5 h-5 text-red-600" />} loading={isLoading} />
            <StatsCard
              title="Today's Profit"
              value={data?.todayProfit != null ? Number(data.todayProfit) : undefined}
              icon={<FiTrendingUp className="w-5 h-5 text-emerald-600" />}
              variant={data?.todayProfit && Number(data.todayProfit) >= 0 ? 'default' : 'warning'}
              loading={isLoading}
            />
            <StatsCard
              title="Low Stock"
              value={data?.lowStockCount}
              icon={<FiAlertTriangle className="w-5 h-5 text-amber-600" />}
              variant={data?.lowStockCount ? 'warning' : 'default'}
              loading={isLoading}
            />
            <StatsCard
              title="Pending Payments"
              value={data?.pendingPaymentsCount}
              icon={<FiBell className="w-5 h-5 text-blue-600" />}
              variant={data?.pendingPaymentsCount ? 'warning' : 'default'}
              loading={isLoading}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-amber-900 mb-4">7-Day Sales Volume</h2>
              {isLoading ? <Skeleton height="h-48" /> : <UsageChart data={data?.dailyUsage ?? []} />}
            </div>
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-amber-900 mb-4">
                Low Stock Alerts
                {data?.lowStockCount ? (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{data.lowStockCount}</span>
                ) : null}
              </h2>
              <LowStockTable products={data?.lowStockProducts ?? []} loading={isLoading} />
            </div>
          </div>
        </>
      )}

      {/* ADMIN: today's sales summary */}
      {role === 'ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Today's Revenue" value={data?.todayRevenue != null ? Number(data.todayRevenue) : undefined} icon={<FiDollarSign className="w-5 h-5 text-green-600" />} loading={isLoading} />
          <StatsCard title="Today's Costs" value={data?.todayCosts != null ? Number(data.todayCosts) : undefined} icon={<FiTrendingDown className="w-5 h-5 text-red-600" />} loading={isLoading} />
          <StatsCard
            title="Today's Profit"
            value={data?.todayProfit != null ? Number(data.todayProfit) : undefined}
            icon={<FiTrendingUp className="w-5 h-5 text-emerald-600" />}
            variant={data?.todayProfit && Number(data.todayProfit) >= 0 ? 'default' : 'warning'}
            loading={isLoading}
          />
        </div>
      )}

      {/* FINANCE_MANAGER: revenue, costs, profit, pending payments */}
      {role === 'FINANCE_MANAGER' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Today's Revenue" value={data?.todayRevenue != null ? Number(data.todayRevenue) : undefined} icon={<FiDollarSign className="w-5 h-5 text-green-600" />} loading={isLoading} />
          <StatsCard title="Today's Costs" value={data?.todayCosts != null ? Number(data.todayCosts) : undefined} icon={<FiTrendingDown className="w-5 h-5 text-red-600" />} loading={isLoading} />
          <StatsCard
            title="Today's Profit"
            value={data?.todayProfit != null ? Number(data.todayProfit) : undefined}
            icon={<FiTrendingUp className="w-5 h-5 text-emerald-600" />}
            variant={data?.todayProfit && Number(data.todayProfit) >= 0 ? 'default' : 'warning'}
            loading={isLoading}
          />
          <StatsCard
            title="Pending Payments"
            value={data?.pendingPaymentsCount}
            icon={<FiBell className="w-5 h-5 text-blue-600" />}
            variant={data?.pendingPaymentsCount ? 'warning' : 'default'}
            loading={isLoading}
          />
        </div>
      )}

      {/* FACILITY_MANAGER: low-stock alerts */}
      {role === 'FACILITY_MANAGER' && (
        <div className="space-y-4">
          <StatsCard
            title="Low Stock Items"
            value={data?.lowStockCount}
            icon={<FiAlertTriangle className="w-5 h-5 text-amber-600" />}
            variant={data?.lowStockCount ? 'warning' : 'default'}
            loading={isLoading}
          />
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-amber-900 mb-4">
              Low Stock Alerts
              {data?.lowStockCount ? (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{data.lowStockCount}</span>
              ) : null}
            </h2>
            <LowStockTable products={data?.lowStockProducts ?? []} loading={isLoading} />
          </div>
        </div>
      )}

      {/* Fallback while session loads */}
      {!role && isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="h-24" />)}
        </div>
      )}

      {/* NO_ROLE: exploration dashboard */}
      {role === 'NO_ROLE' && (
        <div
          className="relative flex flex-col items-center justify-center py-16 text-center space-y-4 overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
            <div className="w-20 h-20 bg-amber-100/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
              <FaCoffee className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">Welcome to Damot Coffee</h2>
            <p className="text-amber-100 max-w-md mx-auto">
              Your account is pending role assignment. A Super Admin will grant you access soon.
              In the meantime, explore what the system offers below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-2xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-amber-200 shadow-sm p-5 text-left hover:bg-white transition duration-300">
                <FaChartLine className="w-6 h-6 text-amber-600 mb-2" />
                <h3 className="font-semibold text-amber-900 text-sm">Revenue Tracking</h3>
                <p className="text-xs text-amber-600 mt-1">Monitor daily sales and profit margins in real-time.</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-amber-200 shadow-sm p-5 text-left hover:bg-white transition duration-300">
                <FaBoxes className="w-6 h-6 text-amber-600 mb-2" />
                <h3 className="font-semibold text-amber-900 text-sm">Inventory Control</h3>
                <p className="text-xs text-amber-600 mt-1">Track stock levels and get low-stock alerts automatically.</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-amber-200 shadow-sm p-5 text-left hover:bg-white transition duration-300">
                <FaUsers className="w-6 h-6 text-amber-600 mb-2" />
                <h3 className="font-semibold text-amber-900 text-sm">Team Roles</h3>
                <p className="text-xs text-amber-600 mt-1">Role-based access for Admins, Finance, and Facility teams.</p>
              </div>
            </div>
          </div>
        </div>
      )}







      

 

     

 
    </div>

  )
}
