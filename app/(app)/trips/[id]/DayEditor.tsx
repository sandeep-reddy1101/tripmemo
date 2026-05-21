'use client'

import { useState } from 'react'
import { ItineraryDay, ItineraryLocation } from '@/lib/types'
import LocationCard from '@/components/LocationCard'
import { Sparkles, Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'

interface DayEditorProps {
  day: ItineraryDay
  tripId: string
  onSave: (day: ItineraryDay) => void
  onCancel: () => void
  saving: boolean
}

export default function DayEditor({ day, tripId, onSave, onCancel, saving }: DayEditorProps) {
  const [currentDay, setCurrentDay] = useState<ItineraryDay>(day)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAiEdit() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trips/${tripId}/ai-edit-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentDay }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI edit failed')
      setCurrentDay(data.day)
      setAiPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI edit failed')
    } finally {
      setAiLoading(false)
    }
  }

  function deleteLocation(idx: number) {
    setCurrentDay((d) => ({ ...d, locations: d.locations.filter((_, i) => i !== idx) }))
  }

  function addLocation() {
    const blank: ItineraryLocation = {
      name: 'New Location',
      type: 'Attraction',
      time: '10:00 AM',
      duration: '1 hour',
      description: '',
      tickets_required: false,
      ticket_url: null,
      cost_estimate: 'Free',
      maps_query: '',
      tips: '',
      category: 'other',
    }
    setCurrentDay((d) => ({ ...d, locations: [...d.locations, blank] }))
    setEditingIdx(currentDay.locations.length)
  }

  function updateLocation(idx: number, updates: Partial<ItineraryLocation>) {
    setCurrentDay((d) => ({
      ...d,
      locations: d.locations.map((loc, i) => (i === idx ? { ...loc, ...updates } : loc)),
    }))
  }

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="rounded-2xl px-6 py-4 text-white" style={{ backgroundColor: currentDay.color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Day {currentDay.day} — Editing</p>
            <h2 className="text-2xl font-bold mt-0.5">{currentDay.theme}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={() => onSave(currentDay)}
              disabled={saving}
              className="bg-white text-slate-800 hover:bg-white/90 disabled:opacity-60 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* AI edit bar */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-violet-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Ask AI to modify this day
        </p>
        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAiEdit()}
            placeholder='e.g. "Add a coffee stop in the morning" or "Swap the museum with a park"'
            className="flex-1 border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            disabled={aiLoading}
          />
          <button
            onClick={handleAiEdit}
            disabled={aiLoading || !aiPrompt.trim()}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? 'Editing…' : 'Edit'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Locations */}
      <div className="space-y-3">
        {currentDay.locations.map((location, i) => (
          <div key={i}>
            {editingIdx === i ? (
              <LocationEditForm
                location={location}
                onSave={(updates) => { updateLocation(i, updates); setEditingIdx(null) }}
                onCancel={() => setEditingIdx(null)}
              />
            ) : (
              <div className="relative group">
                <LocationCard location={location} dayColor={currentDay.color} />
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingIdx(i)}
                    className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => deleteLocation(i)}
                    className="w-7 h-7 bg-white border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addLocation}
          className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add location
        </button>
      </div>
    </div>
  )
}

function LocationEditForm({
  location,
  onSave,
  onCancel,
}: {
  location: ItineraryLocation
  onSave: (updates: Partial<ItineraryLocation>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...location })

  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-500">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Time</label>
          <input
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Duration</label>
          <input
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-500">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Cost estimate</label>
          <input
            value={form.cost_estimate}
            onChange={(e) => setForm((f) => ({ ...f, cost_estimate: e.target.value }))}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Tips</label>
          <input
            value={form.tips}
            onChange={(e) => setForm((f) => ({ ...f, tips: e.target.value }))}
            className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Done
        </button>
      </div>
    </div>
  )
}
