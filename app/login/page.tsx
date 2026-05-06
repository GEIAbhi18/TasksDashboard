'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, CheckCircle2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    const result = login(email, password)
    setLoading(false)
    if (result.success) {
      toast.success('Welcome back! 👋')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Login failed')
    }
  }



  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-brand-400/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-300" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
        </motion.div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-bold text-white leading-[1.15] mb-6">
              Ship faster.<br />
              Stay aligned.<br />
              <span className="text-brand-300">Zero chaos.</span>
            </h1>
            <p className="text-brand-200/80 text-lg leading-relaxed max-w-sm">
              A premium task management system built for modern teams. Real-time sync, role-based access, and beautiful analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 space-y-3"
          >
            {['Real-time Supabase sync', 'Role-based permissions', 'Drag & drop kanban', 'Analytics & insights'].map((f, i) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span className="text-brand-100/90 text-sm">{f}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-brand-400/60 text-xs"
        >
          © 2024 TaskFlow. All rights reserved.
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-ink mb-2">Sign in</h2>
            <p className="text-ink-muted text-sm">Welcome back. Let's pick up where you left off.</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="you@company.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none
                  ${errors.email ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100' :
                    'border-surface-2 bg-surface-1 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all outline-none
                    ${errors.password ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100' :
                      'border-surface-2 bg-surface-1 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
