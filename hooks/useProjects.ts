'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { Project } from '@/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'

async function fetchProjects(): Promise<Project[]> {
  if (USE_MOCK) return MOCK_PROJECTS
  const { data, error } = await supabase.from('projects').select('*').order('created_at')
  if (error) throw error
  return data || []
}

export function useProjects() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30_000,
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (USE_MOCK) return

    // Clean up any existing channel first (guards against Strict Mode double-invoke)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelName = `projects-realtime-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
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
