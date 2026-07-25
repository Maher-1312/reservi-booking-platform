import { useEffect, useCallback } from 'react'
import { blink } from '@/lib/blink'
import { useAuthStore } from '@/store/auth'
interface AuthError {
  code: string
  message: string
}

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const userType = useAuthStore((s) => s.userType)
  const setUser = useAuthStore((s) => s.setUser)
  const setUserType = useAuthStore((s) => s.setUserType)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const storeSignOut = useAuthStore((s) => s.signOut)

  // Listen to Blink auth state changes and sync to Zustand
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [setUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await blink.auth.signInWithEmail(email, password)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error as AuthError }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const result = await blink.auth.signUp({ email, password })
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error as AuthError }
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await blink.auth.signInWithGoogle()
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error as AuthError }
    }
  }, [])

  const signOut = useCallback(async () => {
    await storeSignOut()
  }, [storeSignOut])

  return {
    user,
    isAuthenticated,
    isLoading,
    userType,
    setUserType,
    refreshUser,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}