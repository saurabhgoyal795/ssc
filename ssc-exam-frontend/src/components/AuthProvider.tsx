'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after first render (Zustand will have loaded from localStorage by then)
    setIsHydrated(true)

    // Check if we have tokens in localStorage
    const accessToken = localStorage.getItem('accessToken')

    // If we have user in store but no access token, clear everything
    if (user && !accessToken) {
      logout()
    }
  }, [user, logout])

  // Don't render children until hydration is complete to prevent flash of wrong auth state
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
