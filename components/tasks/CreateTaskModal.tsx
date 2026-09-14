'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, Project } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { STATUS_CONFIG, cn } from '@/lib/utils'
import { X, Calendar, Flag, AlignLeft, Loader2, AlertCircle, Plus, User as UserIcon } from 'lucide-react'
import { useElaraUsers } from '@/hooks/useTasks'
import toast from 'react-hot-toast'

interface CreateTaskModalProps {
  initialStatus: TaskStatus
  projects: Project[]
  defaultProjectId?: string | null
  onClose: () => void
  onCreateTask: (newTask: {
    title: string
    project_id: string
    status: TaskStatus
    description?: string
    priority?: 'low' | 'medium' | 'high'
    assigned_users?: string[]
    due_date?: string
    progress?: number
    is_blocked?: boolean
    blocker_reason?: string | null
  }) => Promise<void>
}

const ALL_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'delay', 'blocker', 'completed']
const FALLBACK_USERS = ['Kanav', 'Rachit', 'Bhirmala', 'Bhagwan Dass', 'Developer']

export function CreateTaskModal({
  initialStatus,
  projects,
  defaultProjectId,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const { data: dbUsers = [] } = useElaraUsers()
  const availableUsers = dbUsers.length > 0 ? dbUsers.map((u: any) => u.name) : FALLBACK_USERS

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''))
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [selectedUsers, setSelectedUsers] = useState<string[]>(['Developer'])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [isBlocked, setIsBlocked] = useState(initialStatus === 'blocker')
  const [blockerReason, setBlockerReason] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleUser = (userName: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userName)
        ? prev.length > 1
          ? prev.filter((u) => u !== userName)
          : prev
        : [...prev, userName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }
    if (!projectId) {
      toast.error('Please select a project')
      return
    }

    setLoading(true)
    try {
      await onCreateTask({
        title: title.trim(),
        project_id: projectId,
        status,
        description: description.trim() || undefined,
        priority,
        assigned_users: selectedUsers,
        due_date: new Date(dueDate).toISOString(),
        progress: status === 'completed' ? 100 : status === 'in_progress' ? 40 : 0,
        is_blocked: isBlocked || status === 'blocker',
        blocker_reason: (isBlocked || status === 'blocker') ? (blockerReason.trim() || 'Blocked item') : null,
      })
      toast.success(`Task created in ${STATUS_CONFIG[status].label}`)
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-modal border border-surface-2 w-full max-w-lg overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink leading-none">Create New Task</h2>
                <p className="text-xs text-ink-faint mt-1">
                  Adding to <span className="font-semibold text-ink">{STATUS_CONFIG[status].label}</span>
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f4f5f7' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted flex-shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Update site execution progress..."
                className="w-full px-3.5 py-2.5 text-sm bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all font-medium text-ink"
                required
              />
            </div>

            {/* Project & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink cursor-pointer"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const s = e.target.value as TaskStatus
                    setStatus(s)
                    if (s === 'blocker') setIsBlocked(true)
                  }}
                  className="w-full px-3 py-2 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink cursor-pointer"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Blocker alert / input */}
            {(isBlocked || status === 'blocker') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50/80 border border-red-200 rounded-2xl space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Blocker Reason</span>
                </div>
                <input
                  type="text"
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  placeholder="e.g. Awaiting client structural approval..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-red-200 rounded-xl outline-none focus:border-red-400 text-ink"
                />
              </motion.div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add additional context or requirements..."
                className="w-full px-3.5 py-2 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink resize-none"
              />
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <div className="flex gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all',
                        priority === p
                          ? p === 'high'
                            ? 'bg-red-50 border-red-300 text-red-600 shadow-xs'
                            : p === 'medium'
                            ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                          : 'bg-surface-1 border-surface-2 text-ink-muted hover:bg-white'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink cursor-pointer"
                />
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Assign Members
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableUsers.map((name: string) => {
                  const active = selectedUsers.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleUser(name)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5',
                        active
                          ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold shadow-xs'
                          : 'bg-surface-1 border-surface-2 text-ink-faint hover:text-ink hover:bg-white'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-brand-500' : 'bg-slate-300')} />
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-surface-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-1 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Task</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
