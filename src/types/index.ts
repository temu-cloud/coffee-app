export interface Product {
  id: string
  name: string
  category: string
  unit: string
  stock: number
  lowStockThreshold: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'NO_ROLE' | 'SUPER_ADMIN' | 'ADMIN' | 'FINANCE_MANAGER' | 'FACILITY_MANAGER'
  createdAt: string
}

export interface Transaction {
  id: string
  productId: string
  userId: string
  type: 'STOCK_IN' | 'STOCK_OUT'
  quantity: number
  note: string | null
  createdAt: string
  product: Pick<Product, 'id' | 'name'>
  user: Pick<User, 'id' | 'name'>
}

export interface DashboardStats {
  totalProducts: number
  lowStockCount: number
  todayStockOut: number
  todayStockIn: number
  lowStockProducts: Array<Pick<Product, 'id' | 'name' | 'stock' | 'lowStockThreshold'>>
  dailyUsage: Array<{ date: string; quantity: number }>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ProductQuery {
  page?: number
  pageSize?: number
  search?: string
  category?: string
}

export interface TransactionQuery {
  page?: number
  pageSize?: number
  search?: string
  type?: 'STOCK_IN' | 'STOCK_OUT'
  from?: string
  to?: string
}

export interface ApiError {
  error: string
  code?: string
}

export interface AppError {
  status: number
  message: string
}

// ── Damot Coffee Management types ────────────────────────────────────────────

export type ItemCategory = 'INGREDIENT' | 'FINISHED_GOOD'
export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'

export interface InventoryItem {
  id: string
  category: ItemCategory
  date: string
  name: string
  units: string
  quantity: string
  unitCost: string
  totalCost: string
  supplier: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
  deletedById?: string | null
}

export interface SupplyItem {
  id: string
  date: string
  name: string
  units: string
  quantity: string
  unitCost: string
  totalCost: string
  supplier: string
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export interface Asset {
  id: string
  name: string
  category: string
  acquisitionDate: string
  quantity: number
  unitCost: string
  totalCost: string
  condition: AssetCondition
  notes?: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export interface PriceHistory {
  id: string
  itemName: string
  price: string
  effectiveDate: string
  createdAt: string
  createdById: string
  inventoryItemId?: string | null
}

export interface DailySale {
  id: string
  date: string
  itemName: string
  unitPrice: string
  quantitySold: string
  saleTotal: string
  inventoryItemId?: string | null
  priceHistoryId?: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export interface DailyExpense {
  id: string
  date: string
  itemName: string
  quantity: string
  unitPrice: string
  totalPrice: string
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export interface Payment {
  id: string
  date: string
  payee: string
  description: string
  amount: string
  paymentMethod: string
  executedAt?: string | null
  executedById?: string | null
  createdAt: string
  updatedAt: string
  createdById: string
}

export interface Budget {
  id: string
  periodMonth: number
  periodYear: number
  category: string
  allocatedAmount: string
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

// ── Query param interfaces ────────────────────────────────────────────────────

export interface InventoryQuery {
  search?: string
  category?: ItemCategory
  page?: number
  pageSize?: number
}

export interface SupplyQuery {
  search?: string
  page?: number
  pageSize?: number
}

export interface AssetQuery {
  page?: number
  pageSize?: number
}

export interface SaleQuery {
  from?: string
  to?: string
  inventoryItemId?: string
  page?: number
  pageSize?: number
}

export interface ExpenseQuery {
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface PaymentQuery {
  from?: string
  to?: string
  executed?: boolean
  page?: number
  pageSize?: number
}

export interface BudgetQuery {
  periodYear?: number
  periodMonth?: number
}

export interface ReportQuery {
  from: string
  to: string
}

// ── Report response types ─────────────────────────────────────────────────────

export interface PnlReport {
  totalRevenue: string
  totalCosts: string
  totalProfit: string
  dailyBreakdown: Array<{
    date: string
    revenue: string
    costs: string
    profit: string
  }>
}

export type SalesVolumeReport = Array<{
  inventoryItemId: string
  itemName: string
  date: string
  quantitySold: string
}>

export type CostAnalysisReport = Array<{
  category: string
  totalCost: string
}>

export interface DashboardStatsV2 extends DashboardStats {
  todayRevenue: string
  todayCosts: string
  todayProfit: string
  pendingPaymentsCount: number
  pendingPaymentsTotal: string
}
