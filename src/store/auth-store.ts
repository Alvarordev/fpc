import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import { AUTH_COOKIE_NAME } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const cookieStorage = {
  getItem(name: string): StorageValue<AuthState> | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
    if (!match) return null
    try {
      return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
    } catch {
      return null
    }
  },
  setItem(name: string, value: StorageValue<AuthState>): void {
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; expires=${expires.toUTCString()}`
  },
  removeItem(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => {
        void supabase.auth.signOut()
        set({ user: null })
        cookieStorage.removeItem(AUTH_COOKIE_NAME)
      },
    }),
    {
      name: AUTH_COOKIE_NAME,
      storage: cookieStorage,
    },
  ),
)
