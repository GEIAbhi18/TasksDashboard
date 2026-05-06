'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus } from '@/types'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/lib/auth-store'
import { KanbanColumn } from './KanbanColumn'
import { TaskModal } from './TaskModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { STATUS_CONFIG } from '@/lib/utils'
import { LayoutGrid, List, Filter, FolderOpen } from 'lucide-react'
import { TaskCard } from './TaskCard'
import toast from 'react-hot-toast'

const ALL_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'delay', 'blocker', 'completed']

interface TaskPanelProps {
  selectedProjectId: string | null
}

type ViewMode = 'kanban' | 'list'

export function TaskPanel({ selectedProjectId }: TaskPanelProps) {
  const user = useAuthStore((s) => s.user)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const { data: tasks = [], isLoading, statusMutation } = useTasks(selectedProjectId ?? undefined)
  const { data: projects = [] } = useProjects()

  const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter)

  const handleUpdateStatus = async (id: string, status: TaskStatus) => {
    await statusMutation.mutateAsync({ id, status })
    toast.success(`Status updated to "${STATUS_CONFIG[status].label}"`)
  }

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    statusMutation.mutate({ id: taskId, status: newStatus })
    toast.success(`Moved to "${STATUS_CONFIG[newStatus].label}"`)
  }

  const tasksByStatus = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status)

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-ink text-lg">
            {selectedProject ? selectedProject.name : 'All Tasks'}
          </h2>
          <p className="text-xs text-ink-faint mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="appearance-none pl-8 pr-3 py-2 text-xs font-medium bg-white border border-surface-2 rounded-xl outline-none focus:border-brand-300 transition-colors cursor-pointer"
            >
              <option value="all">All statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-faint pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface-1 rounded-xl p-1 border border-surface-2">
            {([['kanban', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white shadow-card text-brand-600' : 'text-ink-faint hover:text-ink'}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className={viewMode === 'kanban' ? 'flex gap-4 overflow-x-auto pb-4' : 'space-y-2'}>
          {viewMode === 'kanban'
            ? (statusFilter === 'all' ? ALL_STATUSES : [statusFilter]).map((s) => (
                <div key={s} className="min-w-[280px] space-y-3">
                  <div className="skeleton h-5 w-24 rounded-lg" />
                  {[1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
              ))
            : Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          }
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center flex-1 py-16"
        >
          <div className="w-16 h-16 bg-surface-1 rounded-2xl flex items-center justify-center mb-4 border border-surface-2">
            <FolderOpen className="w-7 h-7 text-ink-faint" />
          </div>
          <h3 className="font-bold text-ink mb-1">No tasks yet</h3>
          <p className="text-sm text-ink-muted text-center max-w-xs">
            {selectedProject ? `No tasks in "${selectedProject.name}"` : 'Select a project or tasks will appear here'}
          </p>
        </motion.div>
      )}

      {/* Kanban view */}
      {!isLoading && tasks.length > 0 && viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {(statusFilter === 'all' ? ALL_STATUSES : [statusFilter]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus(status)}
              projectNames={projectNames}
              onTaskClick={setSelectedTask}
              onDropTask={handleDrop}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {!isLoading && tasks.length > 0 && viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2.5 overflow-y-auto flex-1 pr-0.5"
        >
          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <TaskCard
                task={task}
                projectName={projectNames[task.project_id]}
                onClick={() => setSelectedTask(task)}
                dragHandleProps={{}}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Task modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            projectName={projectNames[selectedTask.project_id]}
            onClose={() => setSelectedTask(null)}
            onUpdateStatus={handleUpdateStatus}
            isManager={user?.role === 'Manager'}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
