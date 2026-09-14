import { Project, Task, Department } from '@/types'

export const ELARA_DEPARTMENTS: Department[] = [
  {
    id: 'dept-sales-crm',
    name: 'Sales & CRM',
    description: 'Leads, follow-ups, site visits, bookings, payment milestones, documentation.',
    team_name: 'Elara Home',
  },
  {
    id: 'dept-construction-design',
    name: 'Construction & Design',
    description: 'Site execution, drawings, consultant decisions, contractor actions, quality and safety issues.',
    team_name: 'Elara Home',
  },
  {
    id: 'dept-approvals-compliance',
    name: 'Approvals & Compliance',
    description: 'TCP/RERA matters, government approvals, licences, statutory submissions and renewals.',
    team_name: 'Elara Home',
  },
  {
    id: 'dept-finance-procurement',
    name: 'Finance & Procurement',
    description: 'Budgets, purchase orders, vendor payments, quotations, billing and cost approvals.',
    team_name: 'Elara Home',
  },
  {
    id: 'dept-marketing-cx',
    name: 'Marketing & Customer Experience',
    description: 'Campaigns, brochures, events, website updates, buyer communication and handover preparation.',
    team_name: 'Elara Home',
  },
  {
    id: 'dept-project-admin',
    name: 'Project Administration',
    description: 'Hiring, manpower, meetings, reporting, travel, office/site requirements and general coordination.',
    team_name: 'Elara Home',
  },
]

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'elara-sales-crm',
    name: 'Sales & CRM Project',
    department: 'Sales & CRM',
    team_name: 'Elara Home',
    description: 'Leads, follow-ups, site visits, bookings, payment milestones, documentation.',
    color: '#3b82f6',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'elara-construction-design',
    name: 'Construction & Design Project',
    department: 'Construction & Design',
    team_name: 'Elara Home',
    description: 'Site execution, drawings, consultant decisions, contractor actions, quality and safety issues.',
    color: '#10b981',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'elara-approvals-compliance',
    name: 'Approvals & Compliance Project',
    department: 'Approvals & Compliance',
    team_name: 'Elara Home',
    description: 'TCP/RERA matters, government approvals, licences, statutory submissions and renewals.',
    color: '#8b5cf6',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'elara-finance-procurement',
    name: 'Finance & Procurement Project',
    department: 'Finance & Procurement',
    team_name: 'Elara Home',
    description: 'Budgets, purchase orders, vendor payments, quotations, billing and cost approvals.',
    color: '#f59e0b',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'elara-marketing-cx',
    name: 'Marketing & Customer Experience Project',
    department: 'Marketing & Customer Experience',
    team_name: 'Elara Home',
    description: 'Campaigns, brochures, events, website updates, buyer communication and handover preparation.',
    color: '#ec4899',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'elara-project-admin',
    name: 'Project Administration Project',
    department: 'Project Administration',
    team_name: 'Elara Home',
    description: 'Hiring, manpower, meetings, reporting, travel, office/site requirements and general coordination.',
    color: '#06b6d4',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

export const MOCK_TASKS: Task[] = []
