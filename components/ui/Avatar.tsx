import { getInitials, cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-pink-400 to-pink-600',
  'from-amber-400 to-amber-600',
  'from-emerald-400 to-emerald-600',
  'from-cyan-400 to-cyan-600',
]

function getColor(name: string) {
  if (!name) return AVATAR_COLORS[0]
  const i = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  const safeName = name || '?'
  const sizeMap = { xs: 'w-5 h-5 text-[9px]', sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs' }
  return (
    <div
      title={safeName}
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-white',
        getColor(safeName), sizeMap[size], className
      )}
    >
      {getInitials(safeName)}
    </div>
  )
}

interface AvatarGroupProps {
  names?: string[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }: AvatarGroupProps) {
  const safeNames = names ?? []
  const visible = safeNames.slice(0, max)
  const extra = safeNames.length - max

  return (
    <div className="flex -space-x-1.5">
      {visible.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'rounded-full bg-surface-2 border-2 border-white flex items-center justify-center text-ink-muted font-bold',
            size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
