import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TaskStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200',
    dot: 'bg-slate-500',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  delay: {
    label: 'Delayed',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  blocker: {
    label: 'Blocker',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

export const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#6366f1',
]

export function getProjectColor(id: string): string {
  const index = id.charCodeAt(id.length - 1) % PROJECT_COLORS.length
  return PROJECT_COLORS[index]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export const MOCK_ASSIGNED = ['Asif', 'Kanav', 'Priya', 'Rahul', 'Sara']
