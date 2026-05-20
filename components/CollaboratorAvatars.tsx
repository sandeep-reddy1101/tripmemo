import { TripMember } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import { Users } from 'lucide-react'

interface CollaboratorAvatarsProps {
  members: TripMember[]
  maxVisible?: number
  size?: 'sm' | 'md'
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
}

const gradients = [
  'from-blue-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
]

export default function CollaboratorAvatars({
  members,
  maxVisible = 3,
  size = 'md',
}: CollaboratorAvatarsProps) {
  if (!members || members.length === 0) {
    return (
      <div className="flex items-center gap-1 text-slate-400">
        <Users className="w-4 h-4" />
        <span className="text-xs">Just you</span>
      </div>
    )
  }

  const visible = members.slice(0, maxVisible)
  const overflow = members.length - maxVisible

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((member, i) => {
          const name = member.user?.full_name ?? 'User'
          const gradient = gradients[i % gradients.length]

          return (
            <div
              key={member.id}
              title={name}
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold border-2 border-white`}
            >
              {member.user?.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(name)
              )}
            </div>
          )
        })}
        {overflow > 0 && (
          <div
            className={`${sizeClasses[size]} rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white`}
          >
            +{overflow}
          </div>
        )}
      </div>
      {members.length === 1 && (
        <span className="ml-2 text-xs text-slate-500">
          {members[0].user?.full_name ?? 'Solo trip'}
        </span>
      )}
    </div>
  )
}
