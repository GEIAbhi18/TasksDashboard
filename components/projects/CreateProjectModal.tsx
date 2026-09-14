'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Department } from '@/types'
import { X, FolderPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateProjectModalProps {
  departments: Department[]
  defaultDepartment?: string
  onClose: () => void
  onCreateProject: (project: {
    name: string
    department: string
    description?: string
  }) => Promise<{ id: string; name: string }>
  onProjectCreated?: (projectId: string) => void
}

export function CreateProjectModal({
  departments,
  defaultDepartment,
  onClose,
  onCreateProject,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [department, setDepartment] = useState(
    defaultDepartment && defaultDepartment !== 'all'
      ? defaultDepartment
      : departments[0]?.name || 'Sales & CRM'
  )
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)
    try {
      const created = await onCreateProject({
        name: name.trim(),
        department,
        description: description.trim() || undefined,
      })
      toast.success(`Project "${name}" created!`)
      if (onProjectCreated && created?.id) {
        onProjectCreated(created.id)
      }
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-modal border border-surface-2 w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink leading-none">New Project</h2>
                <p className="text-xs text-ink-faint mt-1">Add a project under Elara Home</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f4f5f7' }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted flex-shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Elara Home – Phase 2 Villas"
                className="w-full px-3.5 py-2.5 text-sm bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all font-medium text-ink"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink cursor-pointer"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of project objectives and scope..."
                className="w-full px-3.5 py-2 text-xs bg-surface-1 border border-surface-2 rounded-xl outline-none focus:border-brand-400 focus:bg-white transition-all font-medium text-ink resize-none"
              />
            </div>

            <div className="pt-3 border-t border-surface-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-1 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Project</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
