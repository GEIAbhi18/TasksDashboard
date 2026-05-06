'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { useProjects } from '@/hooks/useProjects'
import { getProjectColor, getInitials, cn } from '@/lib/utils'
import {
  LayoutDashboard, Settings, LogOut, Zap, Search,
  FolderKanban, ChevronRight, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ selectedProjectId, onSelectProject, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: projects = [], isLoading } = useProjects()
  const [search, setSearch] = useState('')

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-surface-2 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-surface-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-[17px] text-ink tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 pt-4 pb-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-muted hover:bg-surface-1 hover:text-ink'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="h-px bg-surface-2 mx-4 my-2" />

      {/* Projects section */}
      <div className="px-3 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Projects</span>
          {user?.role === 'Manager' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-ink-faint hover:text-brand-600 hover:bg-brand-50 transition-colors"
              onClick={() => toast('Feature coming soon! 🚀', { icon: '⚡' })}
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-1 border border-surface-2 rounded-lg outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 transition-all"
          />
        </div>

        {/* Project list */}
        <div className="overflow-y-auto flex-1 space-y-0.5 pr-0.5">
          {/* All projects option */}
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => onSelectProject(null)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left',
              selectedProjectId === null
                ? 'bg-surface-1 text-ink font-medium'
                : 'text-ink-muted hover:bg-surface-1 hover:text-ink'
            )}
          >
            <FolderKanban className="w-3.5 h-3.5 flex-shrink-0 text-ink-faint" />
            <span className="truncate">All projects</span>
          </motion.button>

          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                  <div className="skeleton w-3 h-3 rounded-full" />
                  <div className="skeleton h-3 rounded flex-1" />
                </div>
              ))
            : filtered.map((project) => {
                const color = project.color || getProjectColor(project.id)
                const active = selectedProjectId === project.id
                return (
                  <motion.button
                    key={project.id}
                    whileHover={{ x: 2 }}
                    onClick={() => onSelectProject(project.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left group',
                      active
                        ? 'bg-surface-1 text-ink font-medium'
                        : 'text-ink-muted hover:bg-surface-1 hover:text-ink'
                    )}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{project.name}</span>
                    {active && (
                      <ChevronRight className="ml-auto w-3 h-3 text-ink-faint flex-shrink-0" />
                    )}
                  </motion.button>
                )
              })}

          {!isLoading && filtered.length === 0 && (
            <p className="text-xs text-ink-faint text-center py-4">No projects found</p>
          )}
        </div>
      </div>

      {/* User card */}
      <div className="border-t border-surface-2 p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-1 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-ink-faint truncate">{user?.role}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-ink-faint hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </aside>
    </>
  )
}
