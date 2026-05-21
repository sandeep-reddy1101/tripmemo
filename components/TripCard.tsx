import Link from 'next/link'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { Trip, TripMember } from '@/lib/types'
import { formatDateRange, getDestinationGradient } from '@/lib/utils'
import CollaboratorAvatars from './CollaboratorAvatars'

interface TripCardProps {
  trip: Trip
  members: TripMember[]
}

const statusConfig = {
  planning: { label: 'Planning', classes: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', classes: 'bg-stone-100 text-stone-500' },
}

export default function TripCard({ trip, members }: TripCardProps) {
  const gradient = getDestinationGradient(trip.destinations ?? [])
  const status = statusConfig[trip.status]
  const dayCount = trip.itinerary?.days.length ?? 0

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 hover:-translate-y-0.5">
        {/* Cover */}
        <div className={`h-44 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {trip.cover_image_url && (
            <img
              src={trip.cover_image_url}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
              {status.label}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl leading-tight drop-shadow-sm line-clamp-2">
              {trip.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2.5">
          {/* Destinations */}
          {trip.destinations && trip.destinations.length > 0 && (
            <div className="flex items-start gap-2 text-stone-600 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <span className="line-clamp-1">{trip.destinations.join(' → ')}</span>
            </div>
          )}

          {/* Date */}
          {trip.start_date && trip.end_date && (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Calendar className="w-4 h-4 flex-shrink-0 text-stone-400" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
          )}

          {/* Days count */}
          {dayCount > 0 && (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0 text-stone-400" />
              <span>{dayCount} day{dayCount !== 1 ? 's' : ''} planned</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <CollaboratorAvatars members={members} maxVisible={4} size="sm" />
            <span className="text-xs text-stone-400 group-hover:text-amber-600 transition-colors font-medium">
              View trip →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
