'use client'

import { useState } from 'react'
import { Trip, TripPhoto, BrochureData } from '@/lib/types'
import { BookOpen, Loader2, Download, Sparkles, Calendar, MapPin, Camera } from 'lucide-react'
import { formatDateRange } from '@/lib/utils'
import dynamic from 'next/dynamic'

const BrochurePDF = dynamic(() => import('@/components/BrochurePDF'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  ),
})

interface BrochureTabProps {
  trip: Trip
  photos: TripPhoto[]
}

export default function BrochureTab({ trip, photos }: BrochureTabProps) {
  const [brochureData, setBrochureData] = useState<BrochureData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPDF, setShowPDF] = useState(false)

  async function generateBrochure() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: trip.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate brochure')

      setBrochureData(data.brochure)
      setShowPDF(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brochure')
    } finally {
      setLoading(false)
    }
  }

  if (showPDF && brochureData) {
    return (
      <BrochurePDF
        trip={trip}
        photos={photos}
        brochureData={brochureData}
        onBack={() => setShowPDF(false)}
      />
    )
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Trip Brochure</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Generate a beautiful, personalized PDF keepsake with your photos, highlights, and memories
          from this trip.
        </p>

        {/* Trip summary preview */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{trip.destinations?.join(' → ')}</span>
          </div>
          {trip.start_date && trip.end_date && (
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Camera className="w-4 h-4 text-blue-500" />
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''} from you</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={generateBrochure}
          disabled={loading}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating your brochure...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate My Brochure
            </>
          )}
        </button>
      </div>
    </div>
  )
}
