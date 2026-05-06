import { cn } from '@/lib/utils'

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-2 shadow-card space-y-4">
      <div className="flex items-start justify-between">
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-4/5 rounded-lg" />
      <div className="flex items-center justify-between pt-1">
        <div className="flex -space-x-1.5">
          {[1, 2].map((i) => <div key={i} className="skeleton w-6 h-6 rounded-full border-2 border-white" />)}
        </div>
        <div className="skeleton h-2 w-24 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-surface-2">
      <div className="skeleton w-2.5 h-2.5 rounded-full" />
      <div className="skeleton h-3.5 flex-1 rounded-lg" />
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="flex -space-x-1.5">
        {[1, 2].map((i) => <div key={i} className="skeleton w-6 h-6 rounded-full border-2 border-white" />)}
      </div>
    </div>
  )
}

interface SkeletonBoxProps { className?: string }
export function SkeletonBox({ className }: SkeletonBoxProps) {
  return <div className={cn('skeleton rounded-xl', className)} />
}
