import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function run() {
  const { data, error } = await supabase.from('tasks').select('*')
  if (error) console.error(error)
  else {
    console.log("Total tasks:", data.length)
    const statuses = new Set(data.map(t => t.status))
    console.log("Statuses in DB:", Array.from(statuses))
  }
}
run()
