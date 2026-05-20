import { ExternalLink, MapPin, Clock, DollarSign, Info, Ticket } from 'lucide-react'
import { ItineraryLocation } from '@/lib/types'
import { getCategoryIcon, getMapsDirectionsUrl } from '@/lib/utils'

interface LocationCardProps {
  location: ItineraryLocation
  dayColor: string
}

export default function LocationCard({ location, dayColor }: LocationCardProps) {
  const categoryIcon = getCategoryIcon(location.category)
  const mapsUrl = getMapsDirectionsUrl(location.maps_query)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Color accent bar */}
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: dayColor }} />

        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{categoryIcon}</span>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {location.name}
                </h3>
                <div className="flex items-center flex-wrap gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {location.time} · {location.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <DollarSign className="w-3.5 h-3.5" />
                    {location.cost_estimate}
                  </span>
                </div>
              </div>
            </div>

            {location.tickets_required && (
              <span className="flex-shrink-0 flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Ticket className="w-3.5 h-3.5" />
                Tickets
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-3">{location.description}</p>

          {/* Tips */}
          {location.tips && (
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-3">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">{location.tips}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: dayColor }}
            >
              <MapPin className="w-3.5 h-3.5" />
              Get Directions
            </a>

            {location.tickets_required && location.ticket_url && (
              <a
                href={location.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Book Tickets
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
