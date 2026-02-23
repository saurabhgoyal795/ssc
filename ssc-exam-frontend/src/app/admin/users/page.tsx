'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'

interface User {
  id: number
  uuid: string
  email: string
  fullName: string
  phone: string | null
  role: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<any>(`/admin/users?page=${page}&size=20`)
      if (response.data.success) {
        setUsers(response.data.data.content)
        setTotalPages(response.data.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      // If endpoint doesn't exist, show dummy data
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return

    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole })
      loadUsers()
    } catch (error) {
      alert('Failed to update user role')
    }
  }

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this user?`)) return

    try {
      await apiClient.put(`/admin/users/${userId}/status`, { isActive: !isActive })
      loadUsers()
    } catch (error) {
      alert('Failed to update user status')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      STUDENT: 'bg-blue-100 text-blue-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                        {!user.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                            Inactive
                          </span>
                        )}
                        {user.isEmailVerified && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">{user.fullName}</CardTitle>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📧 {user.email}</p>
                        {user.phone && <p>📱 {user.phone}</p>}
                        <p>🆔 ID: {user.id}</p>
                        <p>📅 Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        {user.lastLoginAt && (
                          <p>🕐 Last Login: {new Date(user.lastLoginAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <select
                        className="text-sm px-3 py-1 border rounded"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <Button
                        variant={user.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
