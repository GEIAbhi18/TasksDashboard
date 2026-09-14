'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { useProjects, useDepartments, useCreateProject } from '@/hooks/useProjects'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { getProjectColor, getInitials, cn } from '@/lib/utils'
import {
  LayoutDashboard, Settings, LogOut, Zap, Search,
  FolderKanban, ChevronRight, Plus, Building2, Filter
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
  const departments = useDepartments()
  
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const createProjectMutation = useCreateProject()

  const teamName = user?.team || 'Elara Home'

  // Filter projects by search and selected department
  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesDept = selectedDepartment === 'all' || p.department === selectedDepartment
    return matchesSearch && matchesDept
  })

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
        {/* Logo & Brand */}
        <div className="h-[60px] flex items-center px-5 border-b border-surface-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[18px] text-ink tracking-tight leading-tight">TaskFlow</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 pt-3 pb-2 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer',
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

        <div className="h-px bg-surface-2 mx-4 my-1" />

        {/* Team Section Banner */}
        <div className="px-3 pt-2 pb-1">
          <div className="bg-brand-50/70 border border-brand-100 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-brand-700 uppercase tracking-wider leading-none">Team</p>
              <p className="text-xs font-bold text-ink truncate mt-0.5">{teamName}</p>
            </div>
          </div>
        </div>

        {/* Projects & Department section */}
        <div className="px-3 flex-1 overflow-hidden flex flex-col pt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Projects</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-ink-faint hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
              onClick={() => setCreateProjectOpen(true)}
              title="Create Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative mb-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-faint pointer-events-none" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-surface-1 border border-surface-2 rounded-lg outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 transition-all font-medium text-ink cursor-pointer"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
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
                        'w-full flex flex-col items-start px-3 py-2 rounded-xl text-sm transition-all text-left group',
                        active
                          ? 'bg-surface-1 text-ink font-medium'
                          : 'text-ink-muted hover:bg-surface-1 hover:text-ink'
                      )}
                    >
                      <div className="w-full flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate text-xs font-medium">{project.name}</span>
                        {active && (
                          <ChevronRight className="ml-auto w-3 h-3 text-ink-faint flex-shrink-0" />
                        )}
                      </div>
                      {project.department && (
                        <span className="text-[10px] text-ink-faint ml-5 mt-0.5 truncate">
                          {project.department}
                        </span>
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
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-brand-600 font-medium truncate">{user?.role}</span>
                {user?.team && (
                  <>
                    <span className="text-ink-faint text-[10px]">·</span>
                    <span className="text-[10px] text-ink-faint truncate">{user.team}</span>
                  </>
                )}
              </div>
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

      {/* Create Project Modal */}
      {createProjectOpen && (
        <CreateProjectModal
          departments={departments}
          defaultDepartment={selectedDepartment}
          onClose={() => setCreateProjectOpen(false)}
          onCreateProject={async (newProj) => {
            return await createProjectMutation.mutateAsync(newProj)
          }}
          onProjectCreated={(id) => {
            onSelectProject(id)
          }}
        />
      )}
    </>
  )
}
