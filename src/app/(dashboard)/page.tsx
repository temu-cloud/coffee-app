'use client'
import Link from 'next/link'
import { FaCoffee, FaArrowRight, FaChartLine, FaBoxes, FaUsers, FaLeaf, FaMugHot, FaStore, FaTruck, FaHeart } from 'react-icons/fa'
import { FiClock } from 'react-icons/fi'
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
              <h2 className="text-base font-semibold text-amber-900 mb-4">7-Day Stock Usage</h2>
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
            icon="🔔"
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







      {/* Hero Section with Background Image */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          {/* Coffee Icon */}
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
            <FaCoffee className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-amber-400" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6">
            Coffee Inventory
            <span className="block text-amber-400 mt-1 sm:mt-2">Management System</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto px-2">
            Streamline your coffee business operations, track inventory in real-time,
            and boost your profitability with our comprehensive management solution.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link
              href="/login"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Get Started <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="#explore"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition duration-300 border border-white/30 text-sm sm:text-base"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="explore" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-amber-600">Coffee Inventory?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your coffee business efficiently in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FaChartLine className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Revenue Analysis</h3>
              <p className="text-gray-600">Track daily sales, monitor profits, and analyze business performance with detailed reports.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FaBoxes className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stock Management</h3>
              <p className="text-gray-600">Real-time inventory tracking, low stock alerts, and automated reordering.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-User Roles</h3>
              <p className="text-gray-600">Super Admin, Admin, Finance Manager, and Facility Manager with tailored permissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It <span className="text-amber-600">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, intuitive, and powerful inventory management for your coffee business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Add Products</h3>
              <p className="text-sm text-gray-500">Add coffee beans, supplies, and finished goods to inventory</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Track Sales</h3>
              <p className="text-sm text-gray-500">Record daily sales and monitor revenue in real-time</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Manage Expenses</h3>
              <p className="text-sm text-gray-500">Track costs and optimize your profit margins</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Analyze Reports</h3>
              <p className="text-sm text-gray-500">Generate P&L reports and make data-driven decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-amber-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-amber-200">Coffee Shops Trust Us</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-amber-200">Daily Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-amber-200">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Latest from <span className="text-amber-600">Our Blog</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tips, insights, and stories from the coffee industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=2070&auto=format&fit=crop"
                alt="Coffee brewing"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                  <FiClock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mastering Inventory Management</h3>
                <p className="text-gray-600 mb-4">Learn how to optimize your coffee shop inventory and reduce waste.</p>
                <Link href="#" className="text-amber-600 font-semibold hover:underline flex items-center gap-1">
                  Read More <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=2069&auto=format&fit=crop"
                alt="Coffee shop"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                  <FiClock className="w-4 h-4" />
                  <span>3 min read</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Maximizing Coffee Shop Profits</h3>
                <p className="text-gray-600 mb-4">Strategies to increase revenue and improve your bottom line.</p>
                <Link href="#" className="text-amber-600 font-semibold hover:underline flex items-center gap-1">
                  Read More <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1974&auto=format&fit=crop"
                alt="Coffee beans"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                  <FiClock className="w-4 h-4" />
                  <span>4 min read</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sustainable Coffee Sourcing</h3>
                <p className="text-gray-600 mb-4">How ethical sourcing benefits your business and the planet.</p>
                <Link href="#" className="text-amber-600 font-semibold hover:underline flex items-center gap-1">
                  Read More <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FaHeart className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <p className="text-xl md:text-2xl text-gray-700 italic mb-8">
            "This inventory system transformed how we manage our coffee shop.
            We've reduced waste by 30% and increased profits significantly!"
          </p>
          <div className="flex items-center justify-center gap-4">
            <img
              src="/userphoto.jpg"
              alt="Customer"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="font-semibold">Getaneh Alesew</div>
              <div className="text-sm text-gray-500">Owner of Damote Coffee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Coffee Business?
          </h2>
          <p className="text-lg mb-8 text-amber-100">
            Join thousands of coffee shop owners who trust our inventory management system.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-amber-800 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full transition duration-300"
          >
            Start Free Trial <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaCoffee className="w-6 h-6 text-amber-500" />
                <span className="text-white font-semibold text-lg">Damote Coffee Inventory</span>
              </div>
              <p className="text-sm">Streamlining coffee business operations since 2024.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Damote Coffee Inventory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>

  )
}
