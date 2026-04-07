import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/dashboard'

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    staleTime: 60_000,
  })
