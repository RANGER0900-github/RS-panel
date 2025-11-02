import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) => {
        set({ token, refreshToken, user, isAuthenticated: true })
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

