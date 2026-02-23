import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types'
import { apiClient } from '@/lib/api/client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

interface TestState {
  currentAttemptId: number | null
  responses: Record<number, any>
  bookmarks: Set<number>
  markedForReview: Set<number>
  timeRemaining: number | null
  setCurrentAttempt: (attemptId: number | null) => void
  setResponse: (questionId: number, response: any) => void
  toggleBookmark: (questionId: number) => void
  toggleMarkForReview: (questionId: number) => void
  setTimeRemaining: (seconds: number | null) => void
  clearTestState: () => void
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      setTokens: (accessToken, refreshToken) => {
        apiClient.setAuthTokens(accessToken, refreshToken)
      },
      logout: () => {
        apiClient.removeAuthTokens()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// UI Store
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))

// Test Store (not persisted - cleared after submission)
export const useTestStore = create<TestState>((set) => ({
  currentAttemptId: null,
  responses: {},
  bookmarks: new Set(),
  markedForReview: new Set(),
  timeRemaining: null,
  setCurrentAttempt: (attemptId) => set({ currentAttemptId: attemptId }),
  setResponse: (questionId, response) =>
    set((state) => ({
      responses: { ...state.responses, [questionId]: response },
    })),
  toggleBookmark: (questionId) =>
    set((state) => {
      const newBookmarks = new Set(state.bookmarks)
      if (newBookmarks.has(questionId)) {
        newBookmarks.delete(questionId)
      } else {
        newBookmarks.add(questionId)
      }
      return { bookmarks: newBookmarks }
    }),
  toggleMarkForReview: (questionId) =>
    set((state) => {
      const newMarked = new Set(state.markedForReview)
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId)
      } else {
        newMarked.add(questionId)
      }
      return { markedForReview: newMarked }
    }),
  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
  clearTestState: () =>
    set({
      currentAttemptId: null,
      responses: {},
      bookmarks: new Set(),
      markedForReview: new Set(),
      timeRemaining: null,
    }),
}))
