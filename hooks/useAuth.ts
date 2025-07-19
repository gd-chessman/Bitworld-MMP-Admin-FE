import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  wallet_id: number
  // Thêm các thông tin user khác nếu cần
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  checkAuth: () => boolean
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData))
        set({ user: userData, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false })
      },
      checkAuth: () => {
        const user = localStorage.getItem('user')
        const isAuth = !!user
        if (isAuth) {
          set({ user: JSON.parse(user), isAuthenticated: true })
        }
        return isAuth
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, checkAuth } = useAuthStore()

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    payloadToken: user ? { wallet_id: user.wallet_id } : null
  }
} 