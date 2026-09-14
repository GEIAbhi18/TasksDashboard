export type UserRole = 'Director' | 'Team Member' | 'Developer' | 'Employee' | 'Manager'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  team?: string
  phone?: string
  avatar?: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'delay' | 'blocker' | 'completed'

export interface Task {
  id: string
  title: string
  project_id: string
  status: TaskStatus
  assigned_users: string[]
  description?: string
  progress?: number
  created_at: string
  due_date?: string
  start_date?: string
  priority?: 'low' | 'medium' | 'high'
  // Blocker fields from DB
  is_blocked?: boolean
  blocker_reason?: string | null
  blockers_count?: number
}

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  created_at?: string
  team_id?: string
  team_name?: string
  department?: string
}

export interface Department {
  id: string
  name: string
  description: string
  team_name: string
}

