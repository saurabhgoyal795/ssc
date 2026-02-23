'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: '📊',
  },
  {
    title: 'Questions',
    href: '/admin/questions',
    icon: '❓',
  },
  {
    title: 'Tests',
    href: '/admin/tests',
    icon: '📝',
  },
  {
    title: 'Materials',
    href: '/admin/materials',
    icon: '📚',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: '👥',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else if (user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <h1 className="text-xl font-bold text-blue-600">SSC Admin Panel</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.fullName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-65px)] sticky top-[65px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
