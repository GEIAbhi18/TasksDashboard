import { TaskStatus } from '@/types'
import { STATUS_CONFIG, cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md'
  showDot?: boolean
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    color: 'text-gray-700',
    bg: 'bg-gray-100 border-gray-200',
    dot: 'bg-gray-400'
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        cfg.bg, cfg.color,
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      {showDot && (
        <span className={cn('rounded-full flex-shrink-0', cfg.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      )}
      {cfg.label}
    </span>
  )
}
