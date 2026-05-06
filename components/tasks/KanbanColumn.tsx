'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { STATUS_CONFIG, cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  projectNames: Record<string, string>
  onTaskClick: (task: Task) => void
  onDropTask: (taskId: string, newStatus: TaskStatus) => void
}

export function KanbanColumn({ status, tasks, projectNames, onTaskClick, onDropTask }: KanbanColumnProps) {
  const cfg = STATUS_CONFIG[status]
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
          <span className="text-sm font-bold text-ink">{cfg.label}</span>
        </div>
        <span className="text-xs font-bold text-ink-faint bg-surface-1 border border-surface-2 rounded-full px-2 py-0.5 min-w-[24px] text-center">
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const taskId = e.dataTransfer.getData('taskId')
          if (taskId) onDropTask(taskId, status)
        }}
        className={cn(
          'flex-1 min-h-[200px] rounded-2xl p-2 space-y-2.5 border-2 border-dashed transition-all duration-200',
          isDragOver ? 'border-brand-400 bg-brand-50/60' : 'border-transparent bg-surface-1/40'
        )}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('taskId', task.id)
                  setDraggingId(task.id)
                }}
                onDragEnd={() => setDraggingId(null)}
              >
                <TaskCard
                  task={task}
                  projectName={projectNames[task.project_id]}
                  onClick={() => onTaskClick(task)}
                  isDragging={draggingId === task.id}
                  dragHandleProps={{}}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-ink-faint">
            <div className="w-8 h-8 rounded-xl border-2 border-dashed border-surface-3 flex items-center justify-center mb-2">
              <span className={cn('w-3 h-3 rounded-full', cfg.dot)} />
            </div>
            <p className="text-xs font-medium">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
