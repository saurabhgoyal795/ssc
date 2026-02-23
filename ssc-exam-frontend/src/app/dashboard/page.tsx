'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tests Taken</CardTitle>
              <CardDescription>Total mock tests attempted</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Score</CardTitle>
              <CardDescription>Your overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">-</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Time</CardTitle>
              <CardDescription>Total hours this week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0h</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Take a Mock Test
              </Button>
              <Button className="w-full" variant="outline">
                Browse Study Materials
              </Button>
              <Button className="w-full" variant="outline">
                Watch Video Lectures
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
