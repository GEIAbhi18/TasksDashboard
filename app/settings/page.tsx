'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { getInitials } from '@/lib/utils'
import { Camera, Save, User, Briefcase, Mail, ShieldCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { router.replace('/login'); return }
    setName(user.name)
    setDepartment(user.department || '')
  }, [user, router])

  if (!user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    updateUser({ name: name.trim(), department: department.trim() })
    setSaving(false)
    toast.success('Profile updated!')
  }

  const fields = [
    {
      label: 'Full name', value: name, setter: setName, icon: User,
      placeholder: 'Enter your name', type: 'text',
    },
    {
      label: 'Department', value: department, setter: setDepartment, icon: Briefcase,
      placeholder: 'e.g. Engineering, Design…', type: 'text',
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar selectedProjectId={null} onSelectProject={() => {}} />

      <div className="ml-[260px]">
        <Topbar title="Settings" subtitle="Manage your profile and preferences" />

        <main className="pt-[60px] p-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Avatar card */}
            <div className="bg-white rounded-3xl border border-surface-2 shadow-card p-6 mb-6">
              <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-5">Profile photo</h2>
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-black">
                    {getInitials(user.name)}
                  </div>
                  <button className="absolute inset-0 bg-ink/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-bold text-ink text-lg">{user.name}</p>
                  <p className="text-sm text-ink-muted mt-0.5">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="bg-white rounded-3xl border border-surface-2 shadow-card p-6 mb-6">
              <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-5">Profile information</h2>
              <form onSubmit={handleSave} className="space-y-4">
                {fields.map(({ label, value, setter, icon: Icon, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-2 bg-surface-1 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                ))}

                {/* Read-only fields */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-2 bg-surface-1 text-sm text-ink-faint cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-ink-faint mt-1">Email cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Role</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      type="text"
                      value={user.role}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-2 bg-surface-1 text-sm text-ink-faint cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-ink-faint mt-1">Role is managed by your administrator.</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-70"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save changes</>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-3xl border border-red-100 shadow-card p-6">
              <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Danger zone</h2>
              <div className="flex items-center justify-between gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-ink">Sign out of all devices</p>
                  <p className="text-xs text-ink-muted mt-0.5">This will end all active sessions.</p>
                </div>
                <button
                  onClick={() => toast('Feature coming soon', { icon: '⚠️' })}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  Sign out all
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
