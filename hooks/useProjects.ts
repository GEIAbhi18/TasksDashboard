'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_PROJECTS, ELARA_DEPARTMENTS } from '@/lib/mock-data'
import { Project, Department } from '@/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'

function parseDepartmentFromName(name: string): string | undefined {
  for (const dept of ELARA_DEPARTMENTS) {
    if (name.includes(dept.name)) return dept.name
  }
  return undefined
}

async function fetchProjects(): Promise<Project[]> {
  if (USE_MOCK) return MOCK_PROJECTS
  try {
    // 1. Try dedicated elara_projects table
    const { data: elaraData, error: elaraError } = await supabase
      .from('elara_projects')
      .select('*')
      .order('created_at')

    if (!elaraError && elaraData && elaraData.length > 0) {
      return elaraData.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        created_at: row.created_at,
        team_name: row.team_name || 'Elara Home',
        department: row.department || parseDepartmentFromName(row.name) || 'Project Administration',
        color: row.color || undefined,
      }))
    }

    // 2. Fallback to legacy projects table
    const { data, error } = await supabase.from('projects').select('*').order('created_at')
    if (error || !data || data.length === 0) {
      return MOCK_PROJECTS
    }
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      created_at: row.created_at,
      team_name: 'Elara Home',
      department: (row as any).department || parseDepartmentFromName(row.name) || 'Project Administration',
    }))
  } catch {
    return MOCK_PROJECTS
  }
}

export function useProjects() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 10_000,
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (USE_MOCK) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelName = `projects-realtime-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'elara_projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [queryClient])

  return query
}

export function useDepartments(): Department[] {
  return ELARA_DEPARTMENTS
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProj: { name: string; department: string; description?: string }) => {
      const id = `elara-proj-${Date.now()}`
      const created: Project = {
        id,
        name: newProj.name,
        department: newProj.department,
        description: newProj.description || `Department: ${newProj.department}`,
        team_name: 'Elara Home',
        created_at: new Date().toISOString(),
      }

      if (!USE_MOCK) {
        try {
          // Save directly to elara_projects table in Supabase
          const { error: elaraErr } = await supabase.from('elara_projects').insert([{
            id,
            name: newProj.name,
            department: newProj.department,
            description: newProj.description || `Department: ${newProj.department}`,
            status: 'Active',
            team_name: 'Elara Home',
          }])

          if (elaraErr) {
            console.warn('elara_projects insert fallback:', elaraErr.message)
            // Try legacy projects table as secondary option
            await supabase.from('projects').insert([{
              id,
              name: newProj.name,
              description: newProj.description || `Department: ${newProj.department}`,
              status: 'Active',
            }])
          }
        } catch (err) {
          console.warn('Supabase project insert fallback to cache:', err)
        }
      }

      return created
    },
    onSuccess: (newProj) => {
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [...old, newProj])
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
