'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { FaUserFriends } from 'react-icons/fa'
import { FiTrash2 } from 'react-icons/fi'

interface StaffUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type AppRole = 'NO_ROLE' | 'SUPER_ADMIN' | 'ADMIN' | 'FINANCE_MANAGER' | 'FACILITY_MANAGER'

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: 'NO_ROLE', label: 'No Role' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'FACILITY_MANAGER', label: 'Facility Manager' },
]

const ROLE_BADGE_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default' | 'danger'> = {
  NO_ROLE: 'default',
  SUPER_ADMIN: 'danger',
  ADMIN: 'warning',
  FINANCE_MANAGER: 'success',
  FACILITY_MANAGER: 'info',
}

const ROLE_LABEL: Record<string, string> = {
  NO_ROLE: '⏳ Pending',
  SUPER_ADMIN: '★ Super Admin',
  ADMIN: '✎ Admin',
  FINANCE_MANAGER: ' Finance Manager',
  FACILITY_MANAGER: ' Facility Manager',
}

export default function UsersPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const role = session?.user?.role
  const isSuperAdmin = role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isPending && role !== 'SUPER_ADMIN') router.replace('/')
  }, [role, isPending, router])

  const { data: users = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ['users'],
    queryFn: () => api.get<StaffUser[]>('/users').then((r) => r.data),
    enabled: isSuperAdmin,
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}`, { role }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast('Role updated')
    },
    onError: (e: { message?: string }) => toast(e.message ?? 'Failed', 'error'),
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      if (selectedUser?.id === deleteConfirmId) setSelectedUser(null)
      setDeleteConfirmId(null)
      toast('User deleted')
    },
    onError: (e: { message?: string; status?: number }) => {
      setDeleteConfirmId(null)
      toast(e.message ?? 'Failed to delete', 'error')
    },
  })

  if (isPending || !isSuperAdmin) return null

  const otherUsers = users.filter((u) => u.id !== session?.user?.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-amber-900">User Management</h2>
        <p className="text-sm text-amber-500">Manage team roles and members</p>
      </div>

      {/* Current user card */}
      <div className="bg-amber-800 rounded-xl p-5 text-white flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-2xl font-bold">
          {session?.user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg">{session?.user?.name}</p>
          <p className="text-amber-300 text-sm">{session?.user?.email}</p>
          <span className="inline-block mt-1 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
            SUPER_ADMIN — Full Access
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User list */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm">
          <div className="px-5 py-4 border-b border-amber-100">
            <h3 className="font-semibold text-amber-900">Team Members</h3>
            <p className="text-xs text-amber-500 mt-0.5">Click a user to view details</p>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-amber-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : otherUsers.length === 0 ? (
            <div className="p-10 text-center text-amber-400 text-sm">No other users yet.</div>
          ) : (
            <ul className="divide-y divide-amber-50">
              {otherUsers.map((u) => (
                <li
                  key={u.id}
                  onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                  className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${
                    selectedUser?.id === u.id ? 'bg-amber-50' : 'hover:bg-amber-50/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900 truncate">{u.name}</p>
                    <p className="text-xs text-amber-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      disabled={updateRole.isPending}
                      onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                      className="text-xs border border-amber-200 rounded-lg px-2 py-1 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {deleteConfirmId === u.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteUser.mutate(u.id)}
                          disabled={deleteUser.isPending}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User detail panel */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm">
          {selectedUser ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-lg">
                  {selectedUser.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-amber-900">{selectedUser.name}</p>
                  <p className="text-xs text-amber-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-amber-800">
                <div className="flex justify-between">
                  <span className="text-amber-500">Role</span>
                  <Badge variant={ROLE_BADGE_VARIANT[selectedUser.role] ?? 'default'}>
                    {ROLE_LABEL[selectedUser.role] ?? selectedUser.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500">Joined</span>
                  <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-100">
                {deleteConfirmId === selectedUser.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 flex-1">Delete this user?</span>
                    <button
                      onClick={() => deleteUser.mutate(selectedUser.id)}
                      disabled={deleteUser.isPending}
                      className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(selectedUser.id)}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" /> Delete user
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-amber-300">
              <FaUserFriends className="w-10 h-10 mb-3" />
              <p className="text-sm">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Role reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-2">Role Reference</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="text-xs text-amber-700"><span className="font-medium">NO_ROLE:</span> Exploration dashboard only — awaiting role assignment</div>
          <div className="text-xs text-amber-700"><span className="font-medium">SUPER_ADMIN:</span> Full access to all features</div>
          <div className="text-xs text-amber-700"><span className="font-medium">ADMIN:</span> Dashboard, Sales, Expenses</div>
          <div className="text-xs text-amber-700"><span className="font-medium">FINANCE_MANAGER:</span> Prices, Payments, Reports, Budgets, read-only Inventory/Supplies/Assets</div>
          <div className="text-xs text-amber-700"><span className="font-medium">FACILITY_MANAGER:</span> Inventory, Supplies, Assets management</div>
        </div>
      </div>
    </div>
  )
}
