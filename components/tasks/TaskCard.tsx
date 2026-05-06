'use client'
import { motion } from 'framer-motion'
import { Task } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AvatarGroup } from '@/components/ui/Avatar'
import { formatDate, getProjectColor, cn } from '@/lib/utils'
import { Calendar, Flag, GripVertical } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-emerald-500',
}

interface TaskCardProps {
  task: Task
  projectName?: string
  onClick: () => void
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function TaskCard({ task, projectName, onClick, isDragging, dragHandleProps }: TaskCardProps) {
  const progressColor =
    task.status === 'completed' ? '#10b981' :
    task.status === 'blocker' ? '#ef4444' :
    task.status === 'delay' ? '#f59e0b' :
    task.status === 'pending' ? '#64748b' : '#28a6fa'

  return (
    <motion.div
      layout
      layoutId={`task-${task.id}`}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -2px rgba(0,0,0,.06), 0 12px 32px -8px rgba(0,0,0,.14)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 border border-surface-2 shadow-card cursor-pointer transition-shadow group select-none',
        isDragging && 'opacity-50 rotate-1 shadow-card-hover'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="mt-0.5 opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity text-ink-faint flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-ink leading-snug truncate pr-1">{task.title}</h3>
              {projectName && (
                <p className="text-[11px] text-ink-faint mt-0.5 truncate">{projectName}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={task.status} size="sm" />
            </div>
          </div>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-ink-muted line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
          )}

          {/* Progress bar */}
          {task.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-ink-faint">Progress</span>
                <span className="text-[10px] font-bold" style={{ color: progressColor }}>{task.progress}%</span>
              </div>
              <div className="h-1.5 bg-surface-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: progressColor }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <AvatarGroup names={task.assigned_users} max={3} size="xs" />
            <div className="flex items-center gap-2">
              {task.priority && (
                <Flag className={cn('w-3 h-3', PRIORITY_COLORS[task.priority])} />
              )}
              {task.due_date && (
                <div className="flex items-center gap-1 text-[10px] text-ink-faint">
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.due_date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
