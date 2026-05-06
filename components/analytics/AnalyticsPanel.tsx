'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts'
import { useAllTasks } from '@/hooks/useTasks'
import { Task, TaskStatus } from '@/types'
import { STATUS_CONFIG } from '@/lib/utils'
import { TrendingUp, Target, CheckCircle, Clock } from 'lucide-react'
import { SkeletonBox } from '@/components/ui/Skeleton'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeeklyActivity(tasks: Task[]) {
  const now = new Date()
  return DAYS.map((day, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const count = tasks.filter((t) => {
      const created = new Date(t.created_at)
      return created.toDateString() === d.toDateString()
    }).length
    return { day, count }
  })
}

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eaecf0" strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#28a6fa" strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <span className="absolute text-lg font-black text-ink">{value}%</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-surface-2 rounded-xl px-3 py-2 shadow-card text-xs">
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-brand-600 font-bold">{payload[0].value} tasks</p>
      </div>
    )
  }
  return null
}

export function AnalyticsPanel() {
  const { data: tasks = [], isLoading } = useAllTasks()

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length
    const total = tasks.length
    const completionPct = total ? Math.round((completed / total) * 100) : 0
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const blockers = tasks.filter((t) => t.status === 'blocker').length

    const weekAgo = new Date(Date.now() - 7 * 86400000)
    const completedThisWeek = tasks.filter(
      (t) => t.status === 'completed' && new Date(t.created_at) >= weekAgo
    ).length

    const statusDist = (['pending', 'in_progress', 'delay', 'blocker', 'completed'] as TaskStatus[]).map((s) => ({
      name: STATUS_CONFIG[s].label,
      value: tasks.filter((t) => t.status === s).length,
      color: s === 'completed' ? '#10b981' : s === 'blocker' ? '#ef4444' : s === 'delay' ? '#f59e0b' : s === 'pending' ? '#64748b' : '#28a6fa',
    }))

    return { completed, total, completionPct, inProgress, blockers, completedThisWeek, statusDist }
  }, [tasks])

  const weeklyData = useMemo(() => getWeeklyActivity(tasks), [tasks])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBox className="h-24" />
        <SkeletonBox className="h-40" />
        <SkeletonBox className="h-32" />
      </div>
    )
  }

  const statCards = [
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Blockers', value: stats.blockers, icon: Target, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'This Week', value: stats.completedThisWeek, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-ink mb-0.5">Analytics</h3>
        <p className="text-xs text-ink-faint">Live project insights</p>
      </div>

      {/* Stat cards — 2x2 */}
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-3.5 border border-surface-2 shadow-card"
          >
            <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-ink leading-none">{value}</p>
            <p className="text-[10px] text-ink-faint font-medium mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Completion circle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-4 border border-surface-2 shadow-card"
      >
        <p className="text-xs font-bold text-ink mb-3">Overall completion</p>
        <div className="flex items-center gap-4">
          <CircularProgress value={stats.completionPct} size={80} />
          <div>
            <p className="text-sm font-bold text-ink">{stats.completed} of {stats.total}</p>
            <p className="text-xs text-ink-muted">tasks completed</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-1.5 flex-1 bg-surface-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionPct}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-4 border border-surface-2 shadow-card"
      >
        <p className="text-xs font-bold text-ink mb-3">Weekly activity</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={weeklyData} barSize={14}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(40,166,250,0.06)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell key={i} fill={i === weeklyData.length - 1 ? '#28a6fa' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Status distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-4 border border-surface-2 shadow-card"
      >
        <p className="text-xs font-bold text-ink mb-3">Status breakdown</p>
        <div className="space-y-2.5">
          {stats.statusDist.map(({ name, value, color }) => (
            <div key={name}>
              <div className="flex justify-between text-[10px] font-medium mb-1">
                <span className="text-ink-muted">{name}</span>
                <span className="text-ink font-bold">{value}</span>
              </div>
              <div className="h-1.5 bg-surface-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: stats.total ? `${(value / stats.total) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
