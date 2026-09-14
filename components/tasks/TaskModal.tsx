'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskComment } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AvatarGroup, Avatar } from '@/components/ui/Avatar'
import { STATUS_CONFIG, formatDate, formatDateTime, cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { useElaraUsers } from '@/hooks/useTasks'
import toast from 'react-hot-toast'
import {
  X,
  Calendar,
  Flag,
  AlignLeft,
  Loader2,
  CheckCircle2,
  Trash2,
  UserPlus,
  MessageSquare,
  Send,
  Check,
  Clock,
  UserCheck
} from 'lucide-react'

interface TaskModalProps {
  task: Task | null
  projectName?: string
  onClose: () => void
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>
  onUpdateTask?: (id: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask?: (id: string) => Promise<void>
  isManager: boolean
}

const ALL_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'delay', 'blocker', 'completed']

export function TaskModal({
  task,
  projectName,
  onClose,
  onUpdateStatus,
  onUpdateTask,
  onDeleteTask,
}: TaskModalProps) {
  const currentUser = useAuthStore((s) => s.user)
  const { data: elaraUsers = [] } = useElaraUsers()

  const [saving, setSaving] = useState(false)
  const [localStatus, setLocalStatus] = useState<TaskStatus | null>(null)
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const [reassignSaving, setReassignSaving] = useState(false)

  // Comments state
  const [commentText, setCommentText] = useState('')
  const [isCommentFocused, setIsCommentFocused] = useState(false)
  const [commentSaving, setCommentSaving] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  if (!task) return null

  const currentStatus = localStatus ?? task.status

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === currentStatus) return
    setLocalStatus(status)
    setSaving(true)
    await onUpdateStatus(task.id, status)
    setSaving(false)
  }

  // Handle reassigning user
  const handleToggleUser = async (userName: string) => {
    if (!onUpdateTask) return
    setReassignSaving(true)
    const currentUsers = task.assigned_users || []
    let updatedUsers: string[]
    if (currentUsers.includes(userName)) {
      updatedUsers = currentUsers.filter((u) => u !== userName)
      if (updatedUsers.length === 0) {
        // Keep at least the clicked user if trying to unassign all
        updatedUsers = [userName]
      }
    } else {
      updatedUsers = [...currentUsers, userName]
    }
    await onUpdateTask(task.id, { assigned_users: updatedUsers })
    setReassignSaving(false)
  }

  // Handle adding comment
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = commentText.trim()
    if (!content || !onUpdateTask || commentSaving) return

    setCommentSaving(true)
    const newComment: TaskComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_name: currentUser?.name || 'Developer',
      user_role: currentUser?.role || 'Team Member',
      user_avatar: currentUser?.avatar,
      content,
      created_at: new Date().toISOString(),
    }

    const currentComments = task.comments || []
    const updatedComments = [...currentComments, newComment]

    try {
      await onUpdateTask(task.id, { comments: updatedComments })
      setCommentText('')
      toast.success('Comment saved to database')
    } catch {
      toast.error('Failed to save comment')
    } finally {
      setCommentSaving(false)
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/25 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-modal border border-surface-2 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 sm:py-5 border-b border-surface-1 flex items-start justify-between gap-4 flex-shrink-0 bg-white">
            <div className="min-w-0 flex-1">
              {projectName && (
                <span className="inline-block text-[11px] font-semibold text-brand-600 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-md mb-1.5 truncate max-w-full">
                  {projectName}
                </span>
              )}
              <h2 className="text-lg sm:text-xl font-bold text-ink leading-snug break-words">{task.title}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f4f5f7' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted flex-shrink-0 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Body (scrollable) */}
          <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Current status badge */}
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
              <div className="bg-surface-1/40 p-4 rounded-2xl border border-surface-2/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-ink-faint" />
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Description</span>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Metadata Grid (Dates, Reassignment, Priority, Progress) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-surface-1 rounded-2xl border border-surface-2/50">
              {/* Assigned to & Reassign option */}
              <div className="sm:col-span-2 pb-2 border-b border-surface-2/40">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold">Assigned to</p>
                  <button
                    type="button"
                    onClick={() => setIsReassignOpen(!isReassignOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100/80 border border-brand-200 rounded-lg transition-all cursor-pointer shadow-xs"
                    title="Change or reassign task members"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{isReassignOpen ? 'Done' : 'Reassign'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <AvatarGroup names={task.assigned_users} size="sm" />
                  <div className="flex flex-wrap gap-1.5">
                    {task.assigned_users.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 text-xs font-medium text-ink bg-white border border-surface-2 px-2 py-0.5 rounded-lg shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interactive Reassignment Dropdown / Picker */}
                <AnimatePresence>
                  {isReassignOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-white rounded-xl border border-surface-2 shadow-sm space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs text-ink-muted pb-1 border-b border-surface-1">
                        <span className="font-semibold text-ink">Select team member to assign:</span>
                        {reassignSaving && <Loader2 className="w-3 h-3 text-brand-600 animate-spin" />}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                        {elaraUsers.map((u: any) => {
                          const isAssigned = (task.assigned_users || []).includes(u.name)
                          return (
                            <button
                              key={u.id || u.name}
                              type="button"
                              onClick={() => handleToggleUser(u.name)}
                              disabled={reassignSaving}
                              className={cn(
                                'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left cursor-pointer',
                                isAssigned
                                  ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                                  : 'bg-surface-1/50 border-surface-2 text-ink hover:bg-white hover:border-surface-3'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                  {getInitials(u.name)}
                                </span>
                                <div className="truncate">
                                  <p className="truncate leading-tight font-semibold">{u.name}</p>
                                  <p className="text-[10px] text-ink-faint truncate">{u.role || 'Member'}</p>
                                </div>
                              </div>
                              {isAssigned && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 ml-1" />}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Created */}
              <div>
                <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold mb-1">Date Created</p>
                <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                  <Calendar className="w-3.5 h-3.5 text-ink-faint" />
                  <span>{formatDate(task.created_at)}</span>
                </div>
              </div>

              {/* Expected Completion Date (renamed from Due date) */}
              <div>
                <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold mb-1">
                  Expected Completion Date
                </p>
                <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                  <Clock className="w-3.5 h-3.5 text-ink-faint" />
                  <span>{task.due_date ? formatDate(task.due_date) : 'Not specified'}</span>
                </div>
              </div>

              {/* Actual Completion Date */}
              <div>
                <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold mb-1">
                  Actual Completion Date
                </p>
                {currentStatus === 'completed' ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{formatDate(task.actual_completion_date || task.created_at)}</span>
                  </div>
                ) : (
                  <div className="text-xs text-ink-faint font-medium">
                    <span>—</span>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold mb-1">Priority</p>
                <div className="flex items-center gap-1.5 text-xs text-ink font-medium capitalize">
                  <Flag
                    className={cn(
                      'w-3.5 h-3.5',
                      task.priority === 'high'
                        ? 'text-red-500'
                        : task.priority === 'medium'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    )}
                  />
                  <span>{task.priority || 'Medium'}</span>
                </div>
              </div>

              {/* Progress */}
              {task.progress !== undefined && (
                <div className="sm:col-span-2 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-ink-faint uppercase tracking-wider font-bold">Progress</p>
                    <span className="text-xs font-bold text-ink">{task.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: currentStatus === 'completed' ? '#10b981' : '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status change buttons */}
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2.5">Change status</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                        active
                          ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                          : 'bg-white border-surface-2 text-ink-muted hover:border-surface-3 hover:text-ink'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                      <span className="truncate">{cfg.label}</span>
                      {active && <CheckCircle2 className="w-3 h-3 ml-auto flex-shrink-0" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* JIRA-Style Comments Section */}
            <div className="pt-2 border-t border-surface-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Comments
                  </h3>
                  <span className="text-[11px] font-bold text-ink-muted bg-surface-2 px-1.5 py-0.2 rounded-full">
                    {(task.comments || []).length}
                  </span>
                </div>
              </div>

              {/* List of comments */}
              <div className="space-y-3 mb-4">
                {(task.comments || []).length === 0 ? (
                  <div className="px-4 py-6 text-center bg-surface-1/40 rounded-2xl border border-dashed border-surface-2">
                    <p className="text-xs text-ink-faint">No comments yet. Be the first to leave an update or note!</p>
                  </div>
                ) : (
                  (task.comments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 p-3.5 bg-surface-1/60 rounded-2xl border border-surface-2/60 text-xs transition-colors hover:bg-surface-1"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] shadow-xs">
                        {getInitials(comment.user_name || 'User')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-ink">{comment.user_name}</span>
                          {comment.user_role && (
                            <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200/60 px-1.5 py-0.2 rounded font-medium">
                              {comment.user_role}
                            </span>
                          )}
                          <span className="text-[10px] text-ink-faint ml-auto">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-ink-soft whitespace-pre-wrap leading-relaxed break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-ink text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-1 shadow-xs">
                    {getInitials(currentUser?.name || 'Developer')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment... (Press Enter to send, Shift + Enter for new line)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAddComment()
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all text-ink placeholder:text-ink-faint resize-none font-medium"
                    />

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-[10px] text-ink-faint hidden sm:inline">
                        Press <kbd className="px-1 py-0.5 bg-surface-2 rounded text-[9px] font-bold text-ink">Enter ↵</kbd> to send
                      </span>
                      <div className="flex items-center gap-2 ml-auto">
                        {commentText.trim().length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCommentText('')}
                            className="px-2.5 py-1 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer font-medium"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={!commentText.trim() || commentSaving}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                          title="Send comment"
                        >
                          {commentSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-surface-1 flex justify-between items-center bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-ink-faint">Created {formatDate(task.created_at)}</p>
              {onDeleteTask && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                      await onDeleteTask(task.id)
                      onClose()
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Delete task from Supabase"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 bg-ink text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-ink-soft transition-colors cursor-pointer"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
