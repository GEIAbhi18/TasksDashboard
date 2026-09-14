import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

const HARDCODED_USERS: (User & { password: string })[] = [
  {
    id: 'user-developer',
    email: 'name@goodearthinfra',
    password: 'simple',
    name: 'Developer',
    role: 'Developer',
    team: 'Elara Home',
    department: 'Project Administration',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=developer&backgroundColor=b6e3f4',
  },
  {
    id: '1e4a4d9e-ced8-48f0-afd3-494478f05131',
    email: 'kanav@goodearthinfra.com',
    password: 'simple',
    name: 'Kanav',
    role: 'Director',
    team: 'Elara Home',
    department: 'Sales & CRM',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=kanav&backgroundColor=d1d4f9',
  },
  {
    id: 'user-rachit',
    email: 'rachit@goodearthinfra.com',
    password: 'simple',
    name: 'Rachit',
    role: 'Team Member',
    team: 'Elara Home',
    department: 'Construction & Design',
    phone: '919867272041',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=rachit&backgroundColor=ffd5dc',
  },
  {
    id: 'user-bhirmala',
    email: 'bhirmala@goodearthinfra.com',
    password: 'simple',
    name: 'Bhirmala',
    role: 'Team Member',
    team: 'Elara Home',
    department: 'Approvals & Compliance',
    phone: '918894577707',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=bhirmala&backgroundColor=c0aede',
  },
  {
    id: 'user-bhagwandass',
    email: 'bhagwandass@goodearthinfra.com',
    password: 'simple',
    name: 'Bhagwan Dass',
    role: 'Team Member',
    team: 'Elara Home',
    department: 'Finance & Procurement',
    phone: '919816641892',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=bhagwandass&backgroundColor=ffdfba',
  },
]

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('taskflow-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.user) {
        return parsed.state.user
      }
    }
  } catch {}
  return null
}

interface AuthState {
  user: User | null
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getInitialUser(),
      _hasHydrated: typeof window !== 'undefined',

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (email, password) => {
        const found = HARDCODED_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) return { success: false, error: 'Invalid email or password.' }
        const { password: _pw, ...user } = found
        set({ user })
        return { success: true }
      },

      logout: () => {
        set({ user: null })
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('taskflow-auth')
          } catch {}
        }
      },

      updateUser: (data) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...data } })
      },
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({ user: state.user } as any),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
