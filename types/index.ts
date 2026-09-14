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

export interface TaskComment {
  id: string
  user_name: string
  user_role?: string
  user_avatar?: string
  content: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  project_id: string
  status: TaskStatus
  assigned_users: string[]
  description?: string
  progress?: number
  created_at: string
  due_date?: string // Expected Completion Date
  expected_completion_date?: string
  actual_completion_date?: string | null
  comments?: TaskComment[]
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

