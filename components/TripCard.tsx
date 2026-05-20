import Link from 'next/link'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { Trip, TripMember } from '@/lib/types'
import { formatDateRange, getDestinationGradient } from '@/lib/utils'
import CollaboratorAvatars from './CollaboratorAvatars'

interface TripCardProps {
  trip: Trip
  members: TripMember[]
}

const statusConfig = {
  planning: { label: 'Planning', classes: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', classes: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600' },
}

export default function TripCard({ trip, members }: TripCardProps) {
  const gradient = getDestinationGradient(trip.destinations ?? [])
  const status = statusConfig[trip.status]
  const dayCount = trip.itinerary?.days.length ?? 0

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        {/* Cover */}
        <div className={`h-40 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {trip.cover_image_url && (
            <img
              src={trip.cover_image_url}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
              {status.label}
            </span>
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-xl leading-tight drop-shadow">
              {trip.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Destinations */}
          {trip.destinations && trip.destinations.length > 0 && (
            <div className="flex items-start gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-1">{trip.destinations.join(' → ')}</span>
            </div>
          )}

          {/* Date */}
          {trip.start_date && trip.end_date && (
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Calendar className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
          )}

          {/* Days count */}
          {dayCount > 0 && (
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>{dayCount} day{dayCount !== 1 ? 's' : ''} planned</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <CollaboratorAvatars members={members} maxVisible={4} size="sm" />
            <span className="text-xs text-slate-400 group-hover:text-blue-500 transition-colors font-medium">
              View trip →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
