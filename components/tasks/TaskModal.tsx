'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AvatarGroup } from '@/components/ui/Avatar'
import { STATUS_CONFIG, formatDate, cn } from '@/lib/utils'
import { X, Calendar, Flag, AlignLeft, Loader2, CheckCircle2 } from 'lucide-react'

interface TaskModalProps {
  task: Task | null
  projectName?: string
  onClose: () => void
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>
  isManager: boolean
}

const ALL_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'delay', 'blocker', 'completed']

export function TaskModal({ task, projectName, onClose, onUpdateStatus, isManager }: TaskModalProps) {
  const [saving, setSaving] = useState(false)
  const [localStatus, setLocalStatus] = useState<TaskStatus | null>(null)

  if (!task) return null

  const currentStatus = localStatus ?? task.status

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === currentStatus) return
    setLocalStatus(status)
    setSaving(true)
    await onUpdateStatus(task.id, status)
    setSaving(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-modal border border-surface-2 w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-1 flex items-start justify-between gap-4">
            <div className="min-w-0">
              {projectName && (
                <p className="text-xs text-ink-faint font-medium mb-1">{projectName}</p>
              )}
              <h2 className="text-lg font-bold text-ink leading-snug">{task.title}</h2>
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

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Current status */}
            <div className="flex items-center gap-3">
              <StatusBadge status={currentStatus} />
              {saving && <Loader2 className="w-3.5 h-3.5 text-ink-faint animate-spin" />}
            </div>

            {/* Blocker alert */}
            {task.is_blocked && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-0.5">🔴 Red Marker Blocker</p>
                  {task.blocker_reason ? (
                    <p className="text-xs text-red-500 leading-relaxed">{task.blocker_reason}</p>
                  ) : (
                    <p className="text-xs text-red-400">This task is currently blocked.</p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-3.5 h-3.5 text-ink-faint" />
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Description</span>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface-1 rounded-2xl">
              <div>
                <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mb-1.5">Assigned to</p>
                <AvatarGroup names={task.assigned_users} size="sm" />
              </div>
              {task.due_date && (
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mb-1.5">Due date</p>
                  <div className="flex items-center gap-1.5 text-sm text-ink font-medium">
                    <Calendar className="w-3.5 h-3.5 text-ink-faint" />
                    {formatDate(task.due_date)}
                  </div>
                </div>
              )}
              {task.priority && (
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mb-1.5">Priority</p>
                  <div className="flex items-center gap-1.5 text-sm text-ink font-medium capitalize">
                    <Flag className={cn('w-3.5 h-3.5',
                      task.priority === 'high' ? 'text-red-500' :
                      task.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                    )} />
                    {task.priority}
                  </div>
                </div>
              )}
              {task.progress !== undefined && (
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mb-1.5">Progress</p>
                  <p className="text-sm font-bold text-ink">{task.progress}%</p>
                </div>
              )}
            </div>

            {/* Status change */}
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">Change status</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s]
                  const active = currentStatus === s
                  return (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusChange(s)}
                      disabled={saving}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                        active
                          ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                          : 'bg-white border-surface-2 text-ink-muted hover:border-surface-3 hover:text-ink'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                      {cfg.label}
                      {active && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-surface-1 flex justify-between items-center">
            <p className="text-[11px] text-ink-faint">Created {formatDate(task.created_at)}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink-soft transition-colors"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
