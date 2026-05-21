import { Hotel, Utensils } from 'lucide-react'
import { ItineraryDay as ItineraryDayType } from '@/lib/types'
import LocationCard from './LocationCard'

interface ItineraryDayProps {
  day: ItineraryDayType
  travelTimes?: string[]
}

const mealIcons: Record<string, string> = {
  breakfast: '☕',
  lunch: '🥗',
  dinner: '🍽',
}

export default function ItineraryDayComponent({ day, travelTimes }: ItineraryDayProps) {
  return (
    <div className="space-y-4">
      {/* Day theme header */}
      <div
        className="rounded-2xl px-6 py-4 text-white"
        style={{ backgroundColor: day.color }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Day {day.day}</p>
            <h2 className="text-2xl font-bold mt-0.5">{day.theme}</h2>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">
              {new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-white text-sm font-medium mt-1">
              {day.locations.length} stop{day.locations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Locations timeline */}
      <div>
        {day.locations.map((location, i) => (
          <div key={i}>
            <LocationCard location={location} dayColor={day.color} />
            {i < day.locations.length - 1 && (
              <div className="relative h-8 flex items-center">
                <div
                  className="absolute left-8 top-0 bottom-0 w-px"
                  style={{ backgroundColor: day.color + '40' }}
                />
                {travelTimes?.[i] && (
                  <span className="absolute left-10 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 text-xs text-slate-500 shadow-sm">
                    {travelTimes[i]}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meals section */}
      {day.meals && day.meals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Meals</h3>
          </div>
          <div className="space-y-3">
            {day.meals.map((meal, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{mealIcons[meal.type] ?? '🍴'}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {meal.type}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meal.maps_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-700 hover:text-blue-600 font-medium"
                  >
                    {meal.suggestion}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stay card */}
      {day.stay && (
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${day.color}dd, ${day.color}99)` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-medium mb-0.5">TONIGHT&apos;S STAY</p>
              <h3 className="font-bold text-lg leading-tight">{day.stay.name}</h3>
              <p className="text-white/80 text-sm mt-0.5">{day.stay.address}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-white/90 text-sm font-medium">{day.stay.cost_estimate}</span>
                {day.stay.booking_url && day.stay.booking_url !== '#' && (
                  <a
                    href={day.stay.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Book Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
