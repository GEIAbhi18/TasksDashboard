'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_TASKS } from '@/lib/mock-data'
import { Task, TaskStatus } from '@/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'

// Global mock store for mutations
let mockTasks = [...MOCK_TASKS]

function parseComments(raw: any) {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

// Map Supabase DB row fields → frontend Task type
function mapDbTaskToTask(row: Record<string, any>): Task {
  const isBlocked = row.is_blocked === true
  // If the DB marks it as blocked, override status to 'blocker' regardless of status field
  const rawStatus = (row.status || '').toLowerCase()
  let status: TaskStatus = 'pending'
  if (isBlocked || rawStatus === 'blocker') status = 'blocker'
  else if (rawStatus === 'in progress' || rawStatus === 'in_progress' || rawStatus === 'accepted') status = 'in_progress'
  else if (rawStatus === 'delay' || rawStatus === 'delayed') status = 'delay'
  else if (rawStatus === 'completed' || rawStatus === 'done') status = 'completed'
  else status = 'pending'
  
  // assigned_to in DB is a single user id string or null; assigned_users is an array of display names
  const assignedUsers: string[] = row.assigned_to ? [row.assigned_to] : (row.assigned_users || [])

  const actualCompletionDate = row.actual_completion_date ?? (status === 'completed' ? (row.updated_at || row.created_at) : null)

  return {
    id: row.id,
    title: row.name ?? row.title ?? 'Untitled',
    project_id: row.project_id,
    status,
    assigned_users: assignedUsers,
    description: row.description ?? undefined,
    progress: row.progress ?? 0,
    created_at: row.created_at || new Date().toISOString(),
    due_date: row.deadline ?? row.due_date ?? undefined,
    expected_completion_date: row.deadline ?? row.due_date ?? undefined,
    actual_completion_date: actualCompletionDate,
    comments: parseComments(row.comments),
    start_date: row.planned_start_date ?? row.start_date ?? undefined,
    priority: (row.priority || 'medium').toLowerCase() as any,
    is_blocked: isBlocked,
    blocker_reason: row.blocker_reason ?? null,
    blockers_count: isBlocked ? 1 : 0,
  }
}

async function fetchTasks(projectId?: string): Promise<Task[]> {
  if (USE_MOCK) {
    return projectId ? mockTasks.filter((t) => t.project_id === projectId) : mockTasks
  }
  try {
    // 1. Try dedicated elara_tasks table
    let qElara = supabase.from('elara_tasks').select('*').order('created_at', { ascending: false })
    if (projectId) qElara = qElara.eq('project_id', projectId)
    const { data: elaraData, error: elaraError } = await qElara

    if (!elaraError && elaraData) {
      return elaraData.map((row) => {
        const status = (row.status || 'pending') as TaskStatus
        const actualCompletionDate = row.actual_completion_date ?? (status === 'completed' ? (row.updated_at || row.created_at) : null)
        return {
          id: row.id,
          title: row.title || row.name || 'Untitled',
          project_id: row.project_id,
          status,
          description: row.description || undefined,
          priority: (row.priority || 'medium').toLowerCase() as any,
          progress: row.progress ?? 0,
          assigned_users: row.assigned_users && row.assigned_users.length > 0 ? row.assigned_users : ['Developer'],
          due_date: row.due_date || undefined,
          expected_completion_date: row.due_date || undefined,
          actual_completion_date: actualCompletionDate,
          comments: parseComments(row.comments),
          created_at: row.created_at || new Date().toISOString(),
          is_blocked: row.is_blocked === true,
          blocker_reason: row.blocker_reason || null,
          blockers_count: row.is_blocked ? 1 : 0,
        }
      })
    }

    // 2. Fallback to legacy tasks table
    let q = supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (projectId) q = q.eq('project_id', projectId)
    const { data, error } = await q
    if (error || !data || data.length === 0) {
      return projectId ? mockTasks.filter((t) => t.project_id === projectId) : mockTasks
    }
    return data.map(mapDbTaskToTask)
  } catch {
    return projectId ? mockTasks.filter((t) => t.project_id === projectId) : mockTasks
  }
}

async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const actualCompletionDate = status === 'completed' ? new Date().toISOString() : null
  mockTasks = mockTasks.map((t) =>
    t.id === id
      ? {
          ...t,
          status,
          is_blocked: status === 'blocker',
          actual_completion_date: actualCompletionDate,
        }
      : t
  )
  if (!USE_MOCK) {
    try {
      // 1. Try elara_tasks table
      const payload: Record<string, any> = {
        status,
        is_blocked: status === 'blocker',
        actual_completion_date: actualCompletionDate,
        updated_at: new Date().toISOString(),
      }
      const { error: elaraErr } = await supabase
        .from('elara_tasks')
        .update(payload)
        .eq('id', id)

      // Fallback if column actual_completion_date not yet added in Supabase
      if (elaraErr && elaraErr.message?.includes('actual_completion_date')) {
        delete payload.actual_completion_date
        await supabase.from('elara_tasks').update(payload).eq('id', id)
      }

      // 2. Also try legacy tasks if needed
      if (elaraErr && !id.startsWith('task-')) {
        const dbStatusMap: Record<TaskStatus, string> = {
          pending: 'Pending',
          in_progress: 'In Progress',
          delay: 'Delayed',
          blocker: 'Pending',
          completed: 'Completed',
        }
        await supabase
          .from('tasks')
          .update({ status: dbStatusMap[status] || 'Pending' })
          .eq('id', id)
      }
    } catch (e) {
      console.error('Supabase task status update error:', e)
    }
  }
}

async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const calculatedActualDate =
    updates.status === 'completed' && updates.actual_completion_date === undefined
      ? new Date().toISOString()
      : updates.status && updates.status !== 'completed' && updates.actual_completion_date === undefined
      ? null
      : updates.actual_completion_date

  const fullUpdates = {
    ...updates,
    ...(calculatedActualDate !== undefined ? { actual_completion_date: calculatedActualDate } : {}),
  }

  mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, ...fullUpdates } : t))
  if (!USE_MOCK) {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      if (fullUpdates.title !== undefined) payload.title = fullUpdates.title
      if (fullUpdates.description !== undefined) payload.description = fullUpdates.description
      if (fullUpdates.status !== undefined) {
        payload.status = fullUpdates.status
        payload.is_blocked = fullUpdates.status === 'blocker'
      }
      if (fullUpdates.priority !== undefined) payload.priority = fullUpdates.priority
      if (fullUpdates.progress !== undefined) payload.progress = fullUpdates.progress
      if (fullUpdates.assigned_users !== undefined) payload.assigned_users = fullUpdates.assigned_users
      if (fullUpdates.due_date !== undefined) payload.due_date = fullUpdates.due_date
      if (fullUpdates.actual_completion_date !== undefined) payload.actual_completion_date = fullUpdates.actual_completion_date
      if (fullUpdates.comments !== undefined) payload.comments = fullUpdates.comments
      if (fullUpdates.is_blocked !== undefined) payload.is_blocked = fullUpdates.is_blocked
      if (fullUpdates.blocker_reason !== undefined) payload.blocker_reason = fullUpdates.blocker_reason
      if (fullUpdates.project_id !== undefined) payload.project_id = fullUpdates.project_id

      const { error } = await supabase
        .from('elara_tasks')
        .update(payload)
        .eq('id', id)

      if (error) {
        let retry = false
        if (error.message?.includes('actual_completion_date')) {
          delete payload.actual_completion_date
          retry = true
        }
        if (error.message?.includes('comments')) {
          delete payload.comments
          retry = true
        }
        if (retry) {
          await supabase.from('elara_tasks').update(payload).eq('id', id)
        }
      }
    } catch (e) {
      console.error('Supabase task update error:', e)
    }
  }
}

async function deleteTask(id: string): Promise<void> {
  mockTasks = mockTasks.filter((t) => t.id !== id)
  if (!USE_MOCK) {
    try {
      await supabase.from('elara_tasks').delete().eq('id', id)
    } catch (e) {
      console.error('Supabase task delete error:', e)
    }
  }
}

async function createTask(newTask: {
  title: string
  project_id: string
  status?: TaskStatus
  description?: string
  priority?: 'low' | 'medium' | 'high'
  assigned_users?: string[]
  due_date?: string
  progress?: number
  is_blocked?: boolean
  blocker_reason?: string | null
}): Promise<Task> {
  const id = `task-${Date.now()}`
  const created: Task = {
    id,
    title: newTask.title,
    project_id: newTask.project_id,
    status: newTask.status || 'pending',
    description: newTask.description || undefined,
    priority: newTask.priority || 'medium',
    assigned_users: newTask.assigned_users && newTask.assigned_users.length > 0 ? newTask.assigned_users : ['Developer'],
    due_date: newTask.due_date || new Date(Date.now() + 86400000 * 3).toISOString(),
    progress: newTask.progress ?? 0,
    created_at: new Date().toISOString(),
    is_blocked: newTask.is_blocked || newTask.status === 'blocker',
    blocker_reason: newTask.blocker_reason || null,
    blockers_count: newTask.is_blocked || newTask.status === 'blocker' ? 1 : 0,
  }

  mockTasks = [created, ...mockTasks]

  if (!USE_MOCK) {
    try {
      // 1. Insert directly into elara_tasks in Supabase
      const { error: elaraErr } = await supabase.from('elara_tasks').insert([{
        id,
        project_id: newTask.project_id,
        title: newTask.title,
        description: newTask.description || null,
        status: newTask.status || 'pending',
        priority: newTask.priority || 'medium',
        progress: newTask.progress ?? 0,
        assigned_users: newTask.assigned_users && newTask.assigned_users.length > 0 ? newTask.assigned_users : ['Developer'],
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
        is_blocked: newTask.is_blocked || newTask.status === 'blocker',
        blocker_reason: newTask.blocker_reason || null,
      }])

      if (elaraErr) {
        console.warn('elara_tasks insert fallback:', elaraErr.message)
        // Fallback to legacy tasks table
        const dbStatusMap: Record<TaskStatus, string> = {
          pending: 'Pending',
          in_progress: 'In Progress',
          delay: 'In Progress',
          blocker: 'Pending',
          completed: 'Completed',
        }
        await supabase.from('tasks').insert([{
          title: newTask.title,
          project_id: newTask.project_id,
          status: dbStatusMap[newTask.status || 'pending'] || 'Pending',
          task_type: 'TEAM',
          progress: newTask.progress ?? 0,
          priority: newTask.priority === 'high' ? 'High' : newTask.priority === 'low' ? 'Low' : 'Medium',
          description: newTask.description || null,
          is_blocked: newTask.is_blocked || newTask.status === 'blocker',
          blocker_reason: newTask.blocker_reason || null,
        }])
      }
    } catch (e) {
      console.warn('Supabase task insert fallback to cache:', e)
    }
  }

  return created
}

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    staleTime: 5_000,
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (USE_MOCK) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelName = `tasks-realtime-${projectId ?? 'all'}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'elara_tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      )
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
      const actual_completion_date = status === 'completed' ? new Date().toISOString() : null
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status, is_blocked: status === 'blocker', actual_completion_date } : t)) ?? []
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
      const calculatedActualDate =
        updates.status === 'completed' && updates.actual_completion_date === undefined
          ? new Date().toISOString()
          : updates.status && updates.status !== 'completed' && updates.actual_completion_date === undefined
          ? null
          : updates.actual_completion_date

      const mergedUpdates = {
        ...updates,
        ...(calculatedActualDate !== undefined ? { actual_completion_date: calculatedActualDate } : {}),
      }
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...mergedUpdates } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old = []) => [createdTask, ...old])
      queryClient.setQueryData<Task[]>(['tasks', undefined], (old = []) => [createdTask, ...old])
      queryClient.setQueryData<Task[]>(['tasks', 'all'], (old = []) => [createdTask, ...old])
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = queryClient.getQueryData<Task[]>(['tasks', projectId])
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.filter((t) => t.id !== id) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return { ...query, statusMutation, updateMutation, createMutation, deleteMutation }
}

export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => fetchTasks(),
    staleTime: 10_000,
  })
}

export function useElaraUsers() {
  return useQuery({
    queryKey: ['elara_users'],
    queryFn: async () => {
      if (USE_MOCK) {
        return [
          { id: '1', name: 'Kanav', role: 'Director', phone: null },
          { id: '2', name: 'Rachit', role: 'Team Member', phone: '919867272041' },
          { id: '3', name: 'Bhirmala', role: 'Team Member', phone: '918894577707' },
          { id: '4', name: 'Bhagwan Dass', role: 'Team Member', phone: '919816641892' },
          { id: '5', name: 'Developer', role: 'Developer', phone: null },
        ]
      }
      try {
        const { data, error } = await supabase
          .from('elara_users')
          .select('*')
          .order('name')
        if (!error && data && data.length > 0) return data
        return [
          { id: '1', name: 'Kanav', role: 'Director', phone: null },
          { id: '2', name: 'Rachit', role: 'Team Member', phone: '919867272041' },
          { id: '3', name: 'Bhirmala', role: 'Team Member', phone: '918894577707' },
          { id: '4', name: 'Bhagwan Dass', role: 'Team Member', phone: '919816641892' },
          { id: '5', name: 'Developer', role: 'Developer', phone: null },
        ]
      } catch {
        return [
          { id: '1', name: 'Kanav', role: 'Director', phone: null },
          { id: '2', name: 'Rachit', role: 'Team Member', phone: '919867272041' },
          { id: '3', name: 'Bhirmala', role: 'Team Member', phone: '918894577707' },
          { id: '4', name: 'Bhagwan Dass', role: 'Team Member', phone: '919816641892' },
          { id: '5', name: 'Developer', role: 'Developer', phone: null },
        ]
      }
    },
    staleTime: 60_000,
  })
}
