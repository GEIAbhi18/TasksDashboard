export type UserRole = 'Employee' | 'Manager'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
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
}
