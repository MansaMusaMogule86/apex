/**
 * Session-backed auth hook.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  type LoginPayload,
} from '@/lib/auth-api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  initials: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [bypassActive, setBypassActive] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const current = await fetchCurrentUser()
      const fullName = current.user.fullName
      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')

      setUser({
        id: current.user.id,
        name: fullName,
        email: current.user.email,
        role: current.user.role,
        avatar: initials,
        initials,
      })
      setBypassActive(current.bypass)
    } catch {
      setUser(null)
      setBypassActive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (payload: LoginPayload) => {
    await loginRequest(payload)
    await refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
    setBypassActive(false)
  }, [])

  const isAuthenticated = useMemo(() => Boolean(user), [user])

  return {
    user,
    isAuthenticated,
    isLoading: loading,
    bypassActive,
    login,
    logout,
    refresh,
  }
}