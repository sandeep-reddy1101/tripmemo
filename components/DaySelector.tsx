'use client'

import { ItineraryDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface DaySelectorProps {
  days: ItineraryDay[]
  activeDay: number
  onSelect: (day: number) => void
}

export default function DaySelector({ days, activeDay, onSelect }: DaySelectorProps) {
  return (
    <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
          {days.map((day) => {
            const isActive = activeDay === day.day
            return (
              <button
                key={day.day}
                onClick={() => onSelect(day.day)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={isActive ? { backgroundColor: day.color } : undefined}
              >
                <span className="font-bold">Day {day.day}</span>
                <span className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  {formatDate(day.date, 'MMM d')}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
