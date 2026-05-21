'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, MapPin, Calendar, Users, Heart, DollarSign, Sparkles, ArrowRight } from 'lucide-react'
import AILoadingScreen from '@/components/AILoadingScreen'
import { formatDateRange } from '@/lib/utils'

const budgetOptions = [
  { value: 'budget', label: 'Budget', desc: 'Under $100/day', icon: '🎒' },
  { value: 'moderate', label: 'Moderate', desc: '$100–250/day', icon: '✈️' },
  { value: 'luxury', label: 'Luxury', desc: '$250+/day', icon: '🍾' },
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

  const validDestinations = destinations.filter((d) => d.trim())
  const isReady = validDestinations.length > 0 && startDate && endDate

  function addDestination() { setDestinations([...destinations, '']) }
  function removeDestination(index: number) { setDestinations(destinations.filter((_, i) => i !== index)) }
  function updateDestination(index: number, value: string) {
    const updated = [...destinations]; updated[index] = value; setDestinations(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validDestinations.length === 0) { setError('Please add at least one destination.'); return }
    if (!startDate || !endDate) { setError('Please select travel dates.'); return }
    if (new Date(endDate) < new Date(startDate)) { setError('End date must be after start date.'); return }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinations: validDestinations, start_date: startDate, end_date: endDate, travelers, preferences, budget }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to plan trip')
      router.push(`/trips/${data.trip.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (loading) return <AILoadingScreen destinations={validDestinations} />

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Plan a new trip</h1>
        </div>
        <p className="text-stone-500 ml-[52px]">Tell our AI where you want to go and it will plan everything.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 items-start">
        {/* ── Left: Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destinations */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-4">
              <MapPin className="w-4 h-4 text-amber-500" />
              Where are you going?
            </label>
            <div className="space-y-3">
              {destinations.map((dest, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dest}
                    onChange={(e) => updateDestination(i, e.target.value)}
                    placeholder={i === 0 ? 'e.g. Kyoto, Japan' : 'Add another destination'}
                    className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors"
                  />
                  {destinations.length > 1 && (
                    <button type="button" onClick={() => removeDestination(i)}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addDestination}
              className="mt-3 flex items-center gap-2 text-amber-600 hover:text-amber-500 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Add stop
            </button>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-4">
              <Calendar className="w-4 h-4 text-amber-500" />
              When are you traveling?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block font-medium">Start date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block font-medium">End date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} required
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors" />
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-4">
              <Users className="w-4 h-4 text-amber-500" />
              How many travelers?
            </label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 font-bold text-lg transition-colors">
                −
              </button>
              <span className="text-2xl font-bold text-stone-900 w-8 text-center">{travelers}</span>
              <button type="button" onClick={() => setTravelers(Math.min(20, travelers + 1))}
                className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 font-bold text-lg transition-colors">
                +
              </button>
              <span className="text-stone-500 text-sm">{travelers === 1 ? 'traveler' : 'travelers'}</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
              <Heart className="w-4 h-4 text-amber-500" />
              What do you love?
            </label>
            <p className="text-xs text-stone-400 mb-3">Travel style, interests, dietary needs, pace…</p>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
              placeholder="e.g. We love hiking and outdoor adventures, prefer local food over tourist restaurants, vegetarian, relaxed pace with time for photography..."
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none transition-colors"
            />
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-4">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Budget style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setBudget(opt.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    budget === opt.value
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}>
                  <p className="text-lg mb-1">{opt.icon}</p>
                  <p className={`text-sm font-semibold ${budget === opt.value ? 'text-amber-700' : 'text-stone-700'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-md shadow-amber-200">
            <Sparkles className="w-5 h-5" />
            Generate my itinerary
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-stone-400 text-xs pb-4">AI will generate a full day-by-day plan in 10–30 seconds</p>
        </form>

        {/* ── Right: Sticky preview (lg+) ── */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Preview header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Trip preview
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Destinations */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Destinations</p>
                {validDestinations.length > 0 ? (
                  <div className="space-y-1.5">
                    {validDestinations.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-stone-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        {d}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-300 italic">None yet…</p>
                )}
              </div>

              <hr className="border-stone-100" />

              {/* Dates */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Dates</p>
                <p className="text-sm text-stone-700">
                  {startDate && endDate
                    ? formatDateRange(startDate, endDate)
                    : <span className="text-stone-300 italic">Not set yet…</span>}
                </p>
              </div>

              <hr className="border-stone-100" />

              {/* Travelers & Budget */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Travelers</p>
                  <p className="text-sm text-stone-700 font-medium">{travelers} {travelers === 1 ? 'person' : 'people'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm text-stone-700 font-medium">
                    {budgetOptions.find(o => o.value === budget)?.icon} {budgetOptions.find(o => o.value === budget)?.label}
                  </p>
                </div>
              </div>

              {/* Ready indicator */}
              {isReady ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
                  <p className="text-amber-700 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Ready to generate!
                  </p>
                  <p className="text-amber-500 text-xs mt-1">Hit the button below</p>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-xl p-3.5 text-center">
                  <p className="text-stone-400 text-xs">Fill in destinations + dates to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
