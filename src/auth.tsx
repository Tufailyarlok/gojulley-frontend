import { createContext, useContext, useState, type ReactNode } from 'react'

export interface AuthUser {
  token: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
}

interface AuthState {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  logout: () => void
}

const STORAGE_KEY = 'tripstack_auth'
const AuthContext = createContext<AuthState | undefined>(undefined)

// Read any saved login from the browser so a refresh keeps you logged in.
function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadUser)

  const setUser = (u: AuthUser | null) => {
    setUserState(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>
}

// Convenience hook so components can read/update the logged-in user.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
