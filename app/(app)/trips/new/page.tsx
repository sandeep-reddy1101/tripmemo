'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, MapPin, Calendar, Users, Heart, DollarSign, Sparkles, ArrowRight } from 'lucide-react'
import AILoadingScreen from '@/components/AILoadingScreen'

const budgetOptions = [
  { value: 'budget', label: 'Budget', desc: 'Under $100/day' },
  { value: 'moderate', label: 'Moderate', desc: '$100–250/day' },
  { value: 'luxury', label: 'Luxury', desc: '$250+/day' },
]

export default function NewTripPage() {
  const router = useRouter()

  const [destinations, setDestinations] = useState<string[]>([''])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [preferences, setPreferences] = useState('')
  const [budget, setBudget] = useState('moderate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addDestination() {
    setDestinations([...destinations, ''])
  }

  function removeDestination(index: number) {
    setDestinations(destinations.filter((_, i) => i !== index))
  }

  function updateDestination(index: number, value: string) {
    const updated = [...destinations]
    updated[index] = value
    setDestinations(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validDests = destinations.filter((d) => d.trim())
    if (validDests.length === 0) {
      setError('Please add at least one destination.')
      return
    }
    if (!startDate || !endDate) {
      setError('Please select travel dates.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: validDests,
          start_date: startDate,
          end_date: endDate,
          travelers,
          preferences,
          budget,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to plan trip')
      }

      router.push(`/trips/${data.trip.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const validDestinations = destinations.filter((d) => d.trim())

  if (loading) {
    return <AILoadingScreen destinations={validDestinations} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Plan a new trip</h1>
        </div>
        <p className="text-slate-500 ml-13">
          Tell our AI where you want to go and it will plan everything.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destinations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <MapPin className="w-4 h-4 text-blue-500" />
            Where are you going?
          </label>
          <div className="space-y-3">
            {destinations.map((dest, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={dest}
                  onChange={(e) => updateDestination(i, e.target.value)}
                  placeholder={i === 0 ? 'e.g. Gatlinburg, TN' : 'Add another destination'}
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {destinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDestination(i)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addDestination}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add stop
          </button>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <Calendar className="w-4 h-4 text-blue-500" />
            When are you traveling?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <Users className="w-4 h-4 text-blue-500" />
            How many travelers?
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTravelers(Math.max(1, travelers - 1))}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
            >
              −
            </button>
            <span className="text-2xl font-bold text-slate-900 w-8 text-center">{travelers}</span>
            <button
              type="button"
              onClick={() => setTravelers(Math.min(20, travelers + 1))}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
            >
              +
            </button>
            <span className="text-slate-500 text-sm">
              {travelers === 1 ? 'traveler' : 'travelers'}
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Heart className="w-4 h-4 text-blue-500" />
            What do you love?
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Tell the AI your travel style, interests, dietary needs, pace preference...
          </p>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={3}
            placeholder="e.g. We love hiking and outdoor adventures, prefer local food over tourist restaurants, vegetarian, relaxed pace with time for photography..."
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Budget style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBudget(opt.value)}
                className={`text-left p-3 rounded-xl border-2 transition-colors ${
                  budget === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    budget === opt.value ? 'text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
        >
          <Sparkles className="w-5 h-5" />
          Generate my itinerary
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-slate-400 text-xs">
          AI will generate a full day-by-day plan in 10–30 seconds
        </p>
      </form>
    </div>
  )
}
