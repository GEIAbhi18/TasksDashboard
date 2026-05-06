import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

const HARDCODED_USERS: (User & { password: string })[] = [
  {
    id: 'user-asif',
    email: 'asif@company.com',
    password: '123456',
    name: 'Asif',
    role: 'Employee',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=asif&backgroundColor=b6e3f4',
  },
  {
    id: 'user-kanav',
    email: 'kanav@company.com',
    password: '123456',
    name: 'Kanav',
    role: 'Manager',
    department: 'Product',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=kanav&backgroundColor=d1d4f9',
  },
]

interface AuthState {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: (email, password) => {
        const found = HARDCODED_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) return { success: false, error: 'Invalid email or password.' }
        const { password: _pw, ...user } = found
        set({ user })
        return { success: true }
      },

      logout: () => set({ user: null }),

      updateUser: (data) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...data } })
      },
    }),
    { name: 'taskflow-auth' }
  )
)
