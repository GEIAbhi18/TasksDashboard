import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

export interface AuthUserWithCreds extends User {
  password: string
  aliases?: string[]
}

const HARDCODED_USERS: AuthUserWithCreds[] = [
  {
    id: 'user-developer',
    email: 'name@goodearthinfra',
    aliases: ['developer@goodearthinfra.com', 'name@goodearthinfra.com', 'developer@goodearthinfra', 'developer'],
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
    aliases: ['kanav@goodearthinfra', 'kanav'],
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
    aliases: ['rachit@goodearthinfra', 'rachit'],
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
    aliases: ['bhirmala@goodearthinfra', 'bhirmala'],
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
    aliases: ['bhagwandass@goodearthinfra', 'bhagwandass', 'bhagwan dass'],
    password: 'simple',
    name: 'Bhagwan Dass',
    role: 'Team Member',
    team: 'Elara Home',
    department: 'Finance & Procurement',
    phone: '919816641892',
    avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=bhagwandass&backgroundColor=ffdfba',
  },
]

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
      user: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (inputEmail, inputPassword) => {
        const cleanEmail = (inputEmail || '').trim().toLowerCase()
        const cleanPassword = (inputPassword || '').trim()

        const found = HARDCODED_USERS.find((u) => {
          const emailMatch =
            u.email.toLowerCase() === cleanEmail ||
            (u.aliases && u.aliases.some((a) => a.toLowerCase() === cleanEmail))
          const pwMatch = u.password === cleanPassword
          return emailMatch && pwMatch
        })

        if (!found) {
          return { success: false, error: 'Invalid email or password.' }
        }

        const { password: _pw, aliases: _al, ...user } = found
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
