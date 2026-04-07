import { useQuery } from '@tanstack/react-query'
import { getReportsUsage, getPnlReport, getSalesVolumeReport, getCostAnalysisReport } from '@/services/reports'
import type { ReportsQuery } from '@/services/reports'
import type { ReportQuery } from '@/types'

export const useReports = (params: ReportsQuery) =>
  useQuery({
    queryKey: ['reports', params],
    queryFn: () => getReportsUsage(params),
    enabled: !!params.from && !!params.to,
    staleTime: 30_000,
  })

export const usePnlReport = (params: ReportQuery) =>
  useQuery({
    queryKey: ['reports', 'pnl', params],
    queryFn: () => getPnlReport(params),
    enabled: !!params.from && !!params.to,
    staleTime: 30_000,
  })

export const useSalesVolumeReport = (params: ReportQuery) =>
  useQuery({
    queryKey: ['reports', 'sales-volume', params],
    queryFn: () => getSalesVolumeReport(params),
    enabled: !!params.from && !!params.to,
    staleTime: 30_000,
  })

export const useCostAnalysisReport = (params: ReportQuery) =>
  useQuery({
    queryKey: ['reports', 'cost-analysis', params],
    queryFn: () => getCostAnalysisReport(params),
    enabled: !!params.from && !!params.to,
    staleTime: 30_000,
  })
