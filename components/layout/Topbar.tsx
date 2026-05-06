'use client'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { getInitials, cn } from '@/lib/utils'
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface TopbarProps {
  title?: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Topbar({ title = 'Dashboard', subtitle, onMenuClick }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const [notifOpen, setNotifOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="fixed top-0 lg:left-[260px] left-0 right-0 h-[60px] bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-surface-2 z-20 flex items-center px-4 lg:px-6 gap-3 lg:gap-4 transition-colors">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-ink-muted hover:text-ink transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-ink truncate">{title}</h1>
        {subtitle && <p className="text-xs text-ink-faint truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl border border-surface-2 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        )}

        {/* Notification bell */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen((o) => !o)}
            className="w-9 h-9 rounded-xl border border-surface-2 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </motion.button>

          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-12 w-72 bg-white border border-surface-2 rounded-2xl shadow-modal p-4 z-50"
            >
              <p className="text-xs font-semibold text-ink-muted mb-3 uppercase tracking-wider">Notifications</p>
              {[
                { text: 'Task "API rate limiting" marked as blocker', time: '2m ago', dot: 'bg-red-500' },
                { text: 'Kanav updated the onboarding flow task', time: '18m ago', dot: 'bg-blue-500' },
                { text: '"CI/CD Pipeline" completed ✓', time: '1h ago', dot: 'bg-emerald-500' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-surface-1 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${n.dot}`} />
                  <div>
                    <p className="text-xs text-ink leading-snug">{n.text}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-surface-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-ink leading-none">{user?.name}</p>
            <p className="text-xs text-ink-faint mt-0.5">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
        </div>
      </div>
    </header>
  )
}
