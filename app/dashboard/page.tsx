'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { TaskPanel } from '@/components/tasks/TaskPanel'
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel'
import { useProjects } from '@/hooks/useProjects'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: projects = [] } = useProjects()

  // Auth guard
  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])

  if (!user) return null

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const topbarTitle = selectedProject ? selectedProject.name : 'All Tasks'
  const topbarSubtitle = `Welcome back, ${user.name} · ${user.role}`

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar 
        selectedProjectId={selectedProjectId} 
        onSelectProject={(id) => { setSelectedProjectId(id); setSidebarOpen(false) }} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[260px] transition-all duration-300">
        <Topbar title={topbarTitle} subtitle={topbarSubtitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="pt-[60px] min-h-screen flex flex-col xl:flex-row">
          {/* Main task area */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-w-0 p-4 lg:p-6 overflow-hidden"
          >
            <TaskPanel selectedProjectId={selectedProjectId} />
          </motion.div>

          {/* Right analytics panel */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full xl:w-[280px] flex-shrink-0 border-t xl:border-t-0 xl:border-l border-surface-2 bg-white p-5 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 60px)', position: 'sticky', top: '60px' }}
          >
            <AnalyticsPanel />
          </motion.aside>
        </main>
      </div>
    </div>
  )
}
