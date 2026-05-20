'use client'

import { Trip, TripPhoto, BrochureData } from '@/lib/types'
import { Printer, ArrowLeft, MapPin } from 'lucide-react'
import { formatDateRange, formatDate } from '@/lib/utils'

interface BrochurePDFProps {
  trip: Trip
  photos: TripPhoto[]
  brochureData: BrochureData
  onBack: () => void
}

export default function BrochurePDF({ trip, photos, brochureData, onBack }: BrochurePDFProps) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Brochure preview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-violet-900 p-12 text-white text-center">
          {photos[0]?.public_url && (
            <div className="absolute inset-0">
              <img
                src={photos[0].public_url}
                alt="Cover"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
          )}
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-3">{trip.title}</h1>
            <p className="text-blue-200 text-lg">{trip.destinations?.join(' · ')}</p>
            {trip.start_date && trip.end_date && (
              <p className="text-blue-300 mt-2">{formatDateRange(trip.start_date, trip.end_date)}</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Our Story</h2>
          <p className="text-slate-600 leading-relaxed text-lg">{brochureData.summary}</p>
        </div>

        {/* Day highlights */}
        {trip.itinerary && (
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Day by Day</h2>
            <div className="space-y-6">
              {trip.itinerary.days.map((day, i) => (
                <div key={day.day} className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                    style={{ backgroundColor: day.color }}
                  >
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{day.theme}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {formatDate(day.date, 'EEEE, MMMM d')}
                    </p>
                    {brochureData.day_highlights[i] && (
                      <p className="text-slate-600 mt-2 leading-relaxed">
                        {brochureData.day_highlights[i]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Memories</h2>
            <div className="grid grid-cols-3 gap-3">
              {photos.slice(0, 9).map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-100"
                >
                  <img
                    src={photo.public_url}
                    alt={photo.caption ?? ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
        <p className="text-slate-500 text-sm">
          Use your browser&apos;s print dialog to save as PDF
        </p>
      </div>
    </div>
  )
}
