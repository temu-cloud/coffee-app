import api from './axios'
import type { PnlReport, SalesVolumeReport, CostAnalysisReport, ReportQuery } from '@/types'

export interface ReportsQuery {
  from: string
  to: string
}

export interface DailyUsageEntry {
  date: string
  productId: string
  productName: string
  quantity: number
}

export interface TopProduct {
  productId: string
  productName: string
  totalStockOut: number
}

export interface SummaryEntry {
  productId: string
  productName: string
  totalStockIn: number
  totalStockOut: number
  netChange: number
}

export interface ReportsData {
  dailyUsage: DailyUsageEntry[]
  topProducts: TopProduct[]
  summary: SummaryEntry[]
}

export const getReportsUsage = (params: ReportsQuery) =>
  api.get<ReportsData>('/reports/usage', { params }).then((r) => r.data)

export const getPnlReport = (params: ReportQuery) =>
  api.get<PnlReport>('/reports/pnl', { params }).then((r) => r.data)

export const getSalesVolumeReport = (params: ReportQuery) =>
  api.get<SalesVolumeReport>('/reports/sales-volume', { params }).then((r) => r.data)

export const getCostAnalysisReport = (params: ReportQuery) =>
  api.get<CostAnalysisReport>('/reports/cost-analysis', { params }).then((r) => r.data)
