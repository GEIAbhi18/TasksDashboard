'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_TASKS } from '@/lib/mock-data'
import { Task, TaskStatus } from '@/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'

// Global mock store for demo mutations
let mockTasks = [...MOCK_TASKS]

// Map Supabase DB row fields → frontend Task type
function mapDbTaskToTask(row: Record<string, any>): Task {
  const isBlocked = row.is_blocked === true
  // If the DB marks it as blocked, override status to 'blocker' regardless of status field
  const status: TaskStatus = isBlocked ? 'blocker' : (row.status ?? 'pending')
  
  // assigned_to in DB is a single user id string or null; assigned_users is an array of display names
  // We keep it as a display-friendly array
  const assignedUsers: string[] = row.assigned_to ? [row.assigned_to] : []

  return {
    id: row.id,
    title: row.name ?? row.title ?? 'Untitled',
    project_id: row.project_id,
    status,
    assigned_users: assignedUsers,
    description: row.description ?? undefined,
    progress: row.progress ?? 0,
    created_at: row.created_at,
    due_date: row.deadline ?? row.due_date ?? undefined,
    start_date: row.planned_start_date ?? row.start_date ?? undefined,
    priority: row.priority ?? undefined,
    is_blocked: isBlocked,
    blocker_reason: row.blocker_reason ?? null,
    blockers_count: isBlocked ? 1 : 0,
  }
}

async function fetchTasks(projectId?: string): Promise<Task[]> {
  if (USE_MOCK) {
    return projectId ? mockTasks.filter((t) => t.project_id === projectId) : mockTasks
  }
  let q = supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (projectId) q = q.eq('project_id', projectId)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map(mapDbTaskToTask)
}

async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  if (USE_MOCK) {
    mockTasks = mockTasks.map((t) => t.id === id ? { ...t, status } : t)
    return
  }
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw error
}

async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  if (USE_MOCK) {
    mockTasks = mockTasks.map((t) => t.id === id ? { ...t, ...updates } : t)
    return
  }
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) throw error
}

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    staleTime: 10_000,
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (USE_MOCK) return

    // Clean up any existing channel first (guards against Strict Mode double-invoke)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelName = `tasks-realtime-${projectId ?? 'all'}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [queryClient, projectId])

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = queryClient.getQueryData<Task[]>(['tasks', projectId])
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = queryClient.getQueryData<Task[]>(['tasks', projectId])
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...updates } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return { ...query, statusMutation, updateMutation }
}

export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => fetchTasks(),
    staleTime: 10_000,
  })
}
