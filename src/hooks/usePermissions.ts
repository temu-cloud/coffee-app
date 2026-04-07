import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'

export interface Permissions {
  canAddStock: boolean
  canUseStock: boolean
  canAddProducts: boolean
  canEditProducts: boolean
  canViewReports: boolean
}

export const usePermissions = () =>
  useQuery<Permissions>({
    queryKey: ['permissions', 'me'],
    queryFn: () => api.get<Permissions>('/me/permissions').then((r) => r.data),
    staleTime: 60_000,
  })
