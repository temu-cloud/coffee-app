import api from './axios'
import type { DashboardStatsV2 } from '@/types'

export const getDashboardStats = () =>
  api.get<DashboardStatsV2>('/dashboard/stats').then((r) => r.data)
