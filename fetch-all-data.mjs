import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://iymesslajpqkvxdhjwmy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bWVzc2xhanBxa3Z4ZGhqd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTY4NzEsImV4cCI6MjA4NzU3Mjg3MX0.smGizS-ECU3iad9wCoVlgCHWJxgZAsH_IDddWZ7shbE'
)

async function run() {
  const { data: projects, error: pe } = await supabase.from('projects').select('*')
  if (pe) { console.error('Projects error:', pe); return }
  
  const { data: tasks, error: te } = await supabase.from('tasks').select('*').order('project_id').order('created_at')
  if (te) { console.error('Tasks error:', te); return }

  console.log('\n=== PROJECTS ===')
  for (const p of projects) {
    console.log(`[${p.id}] ${p.name}`)
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))

  console.log('\n=== ALL TASKS (grouped by project) ===')
  const byProject = {}
  for (const t of tasks) {
    if (!byProject[t.project_id]) byProject[t.project_id] = []
    byProject[t.project_id].push(t)
  }

  for (const [pid, ptasks] of Object.entries(byProject)) {
    console.log(`\n--- ${projectMap[pid] || pid} ---`)
    for (const t of ptasks) {
      console.log(`  ID: ${t.id}`)
      console.log(`  Title: "${t.title}"`)
      console.log(`  Status: ${t.status}`)
      console.log(`  Progress: ${t.progress}%`)
      console.log(`  Blockers: ${t.blockers_count ?? t.blocker_count ?? 'N/A'}`)
      console.log(`  Start: ${t.start_date}`)
      console.log(`  Due: ${t.due_date}`)
      console.log(`  Raw fields: ${JSON.stringify(Object.keys(t))}`)
      console.log()
    }
  }
}
run()
