import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { BlinkUser } from '@blinkdotnew/sdk'
import { blink } from '@/lib/blink'
import type { UserType } from '@/types'

export interface AuthState {
  user: BlinkUser | null
  isAuthenticated: boolean
  isLoading: boolean
  userType: UserType | null
  setUser: (user: BlinkUser | null) => void
  setUserType: (type: UserType) => void
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      userType: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setUserType: (type) => set({ userType: type }),

      refreshUser: async () => {
        const currentUser = await blink.auth.me()
        if (currentUser) {
          set({ user: currentUser as BlinkUser, isAuthenticated: true, isLoading: false })
        }
      },

      signOut: async () => {
        await blink.auth.signOut()
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          userType: null,
        })
      },
    }),
    {
      name: 'reservi-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userType: state.userType,
      }),
    }
  )
)
