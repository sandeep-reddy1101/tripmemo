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
  'from-amber-500 to-orange-600',
  'from-teal-500 to-emerald-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
]

export default function CollaboratorAvatars({
  members,
  maxVisible = 3,
  size = 'md',
}: CollaboratorAvatarsProps) {
  if (!members || members.length === 0) {
    return (
      <div className="flex items-center gap-1 text-stone-400">
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
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold border-2 border-white overflow-hidden`}
            >
              {member.user?.avatar_url ? (
                <img src={member.user.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                getInitials(name)
              )}
            </div>
          )
        })}
        {overflow > 0 && (
          <div className={`${sizeClasses[size]} rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold border-2 border-white text-xs`}>
            +{overflow}
          </div>
        )}
      </div>
      {members.length === 1 && (
        <span className="ml-2 text-xs text-stone-500">{members[0].user?.full_name ?? 'Solo trip'}</span>
      )}
    </div>
  )
}
