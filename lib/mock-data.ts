import { Project, Task } from '@/types'

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Platform Redesign', description: 'Full UI overhaul of the main product', color: '#3b82f6' },
  { id: 'p2', name: 'API v2 Migration', description: 'Migrate all endpoints to v2 spec', color: '#8b5cf6' },
  { id: 'p3', name: 'Mobile App', description: 'React Native cross-platform app', color: '#10b981' },
  { id: 'p4', name: 'Analytics Dashboard', description: 'Real-time metrics and reporting', color: '#f59e0b' },
  { id: 'p5', name: 'Auth & Security', description: 'SSO, 2FA, compliance audit', color: '#ef4444' },
]

export const MOCK_TASKS: Task[] = [
  {
    id: 't1', title: 'Design new onboarding flow', project_id: 'p1',
    status: 'in_progress', assigned_users: ['Asif', 'Priya'],
    progress: 65, created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(), priority: 'high',
    description: 'Redesign the full onboarding experience from sign-up to first value moment.',
  },
  {
    id: 't2', title: 'Update component library tokens', project_id: 'p1',
    status: 'completed', assigned_users: ['Kanav'],
    progress: 100, created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    due_date: new Date(Date.now() - 86400000 * 1).toISOString(), priority: 'medium',
    description: 'Migrate all design tokens to the new system.',
  },
  {
    id: 't3', title: 'Implement rate limiting middleware', project_id: 'p2',
    status: 'blocker', assigned_users: ['Rahul', 'Asif'],
    progress: 30, created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 1).toISOString(), priority: 'high',
    description: 'Blocked on infrastructure access. Need DevOps approval.',
  },
  {
    id: 't4', title: 'Write API documentation', project_id: 'p2',
    status: 'delay', assigned_users: ['Sara'],
    progress: 45, created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(), priority: 'medium',
    description: 'Documentation is running behind schedule.',
  },
  {
    id: 't5', title: 'Setup CI/CD pipeline', project_id: 'p3',
    status: 'completed', assigned_users: ['Kanav', 'Rahul'],
    progress: 100, created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    priority: 'high',
    description: 'GitHub Actions pipeline fully configured.',
  },
  {
    id: 't6', title: 'Build push notification system', project_id: 'p3',
    status: 'in_progress', assigned_users: ['Asif'],
    progress: 55, created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(), priority: 'medium',
    description: 'FCM integration for iOS and Android.',
  },
  {
    id: 't7', title: 'Integrate Recharts for metrics', project_id: 'p4',
    status: 'in_progress', assigned_users: ['Priya', 'Sara'],
    progress: 80, created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(), priority: 'low',
    description: 'Real-time chart updates using Recharts.',
  },
  {
    id: 't8', title: 'SSO integration with Okta', project_id: 'p5',
    status: 'delay', assigned_users: ['Kanav'],
    progress: 20, created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 1).toISOString(), priority: 'high',
    description: 'Waiting on Okta admin credentials from client.',
  },
]
