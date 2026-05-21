'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Trip, TripMember, TripPhoto } from '@/lib/types'
import { formatDateRange, getDestinationGradient } from '@/lib/utils'
import { MapPin, Calendar, UserPlus, Camera, BookOpen, Map, Package, DollarSign, ChevronDown, ChevronUp, Pencil, Sparkles, Loader2, X } from 'lucide-react'
import CollaboratorAvatars from '@/components/CollaboratorAvatars'
import DaySelector from '@/components/DaySelector'
import ItineraryDayComponent from '@/components/ItineraryDay'
import PhotosTab from './PhotosTab'
import BrochureTab from './BrochureTab'
import DayEditor from './DayEditor'
import { createClient } from '@/lib/supabase/client'
import { Itinerary, ItineraryDay } from '@/lib/types'

const DayMap = dynamic(() => import('@/components/DayMap'), { ssr: false })

interface TripPageClientProps {
  trip: Trip
  members: TripMember[]
  photos: TripPhoto[]
  currentUserId: string
  userRole: string
}

type TabId = 'plan' | 'photos' | 'brochure'

export default function TripPageClient({
  trip,
  members,
  photos: initialPhotos,
  currentUserId,
  userRole,
}: TripPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('plan')
  const [activeDay, setActiveDay] = useState(1)
  const [photos, setPhotos] = useState<TripPhoto[]>(initialPhotos)
  const [packingOpen, setPackingOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(trip.itinerary)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [savingDay, setSavingDay] = useState(false)
  const [planEditOpen, setPlanEditOpen] = useState(false)
  const [planPrompt, setPlanPrompt] = useState('')
  const [planEditing, setPlanEditing] = useState(false)
  const [planEditError, setPlanEditError] = useState<string | null>(null)
  const [travelTimes, setTravelTimes] = useState<string[]>([])
  const supabase = createClient()

  const gradient = getDestinationGradient(trip.destinations ?? [])
  const currentDay = itinerary?.days.find((d) => d.day === activeDay)

  // Clear stale travel times whenever the selected day changes
  useEffect(() => {
    setTravelTimes([])
  }, [activeDay])

  async function handleSaveDay(updatedDay: ItineraryDay) {
    if (!itinerary) return
    setSavingDay(true)
    const newItinerary = {
      ...itinerary,
      days: itinerary.days.map((d) => (d.day === updatedDay.day ? updatedDay : d)),
    }
    setItinerary(newItinerary)
    setEditingDay(null)
    await fetch(`/api/trips/${trip.id}/itinerary`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary: newItinerary }),
    })
    setSavingDay(false)
  }

  async function handleEditPlan() {
    if (!planPrompt.trim() || !itinerary) return
    setPlanEditing(true)
    setPlanEditError(null)
    try {
      const res = await fetch(`/api/trips/${trip.id}/ai-edit-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: planPrompt, currentItinerary: itinerary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Edit failed')
      setItinerary(data.itinerary)
      setPlanPrompt('')
      setPlanEditOpen(false)
    } catch (err) {
      setPlanEditError(err instanceof Error ? err.message : 'Edit failed')
    } finally {
      setPlanEditing(false)
    }
  }

  // Realtime photo updates
  useEffect(() => {
    const channel = supabase
      .channel(`trip-photos-${trip.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_photos',
          filter: `trip_id=eq.${trip.id}`,
        },
        async (payload) => {
          const newPhoto = payload.new as TripPhoto
          // Fetch uploader info
          const { data: uploader } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', newPhoto.uploaded_by)
            .single()

          const signedRes = await fetch(
            `/api/photos/signed-url?path=${encodeURIComponent(newPhoto.storage_path)}`
          )
          const { url: signedUrl } = signedRes.ok ? await signedRes.json() : { url: '' }

          const uploaderWithCreatedAt = uploader
            ? { ...uploader, created_at: '' }
            : undefined

          setPhotos((prev) => {
            if (prev.some((p) => p.id === newPhoto.id)) return prev
            return [{ ...newPhoto, uploader: uploaderWithCreatedAt, public_url: signedUrl }, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trip.id])

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'plan', label: 'Plan', icon: Map },
    { id: 'photos', label: `Photos (${photos.length})`, icon: Camera },
    { id: 'brochure', label: 'Brochure', icon: BookOpen },
  ]

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* Trip Header */}
      <div className="bg-white border-b border-stone-100">
        {/* Gradient accent strip */}
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Cover thumbnail */}
            {trip.cover_image_url && (
              <div className="hidden sm:block flex-shrink-0">
                <img
                  src={trip.cover_image_url}
                  alt={trip.title}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-stone-200 shadow-sm"
                />
              </div>
            )}

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ${
                    trip.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : trip.status === 'completed'
                      ? 'bg-stone-100 text-stone-600 ring-stone-200'
                      : 'bg-amber-50 text-amber-700 ring-amber-200'
                  }`}
                >
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                {trip.title}
              </h1>
              <div className="flex items-center flex-wrap gap-4 mt-2 text-stone-500 text-sm">
                {trip.destinations && trip.destinations.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {trip.destinations.join(' → ')}
                  </span>
                )}
                {trip.start_date && trip.end_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Collaborators + invite */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <CollaboratorAvatars members={members} maxVisible={4} size="md" />
              {userRole === 'owner' && (
                <Link
                  href={`/trips/${trip.id}/invite`}
                  className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-30 shadow-sm shadow-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Tab */}
      {activeTab === 'plan' && itinerary && (
        <>
          <DaySelector
            days={itinerary.days}
            activeDay={activeDay}
            onSelect={setActiveDay}
          />

          {/* Day editor — full width when active */}
          {currentDay && editingDay === currentDay.day ? (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DayEditor
                day={currentDay}
                tripId={trip.id}
                onSave={handleSaveDay}
                onCancel={() => setEditingDay(null)}
                saving={savingDay}
              />
            </div>
          ) : (
            /* Two-column layout: itinerary left, map right */
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex gap-8 items-start">

                {/* Left column — itinerary */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Edit full plan — owners only */}
                  {userRole === 'owner' && (
                    <div>
                      {!planEditOpen ? (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setPlanEditOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Edit entire plan
                          </button>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Edit entire plan with AI
                            </p>
                            <button
                              onClick={() => { setPlanEditOpen(false); setPlanPrompt(''); setPlanEditError(null) }}
                              className="text-amber-400 hover:text-amber-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={planPrompt}
                            onChange={(e) => setPlanPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !planEditing) handleEditPlan()
                            }}
                            placeholder='e.g. "Replace Day 3 with a beach day", "Add a food tour on Day 2", "Make the whole trip more budget-friendly"'
                            rows={3}
                            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
                            disabled={planEditing}
                          />
                          {planEditError && (
                            <p className="text-xs text-red-600">{planEditError}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-amber-500">⌘↵ to submit</p>
                            <button
                              onClick={handleEditPlan}
                              disabled={planEditing || !planPrompt.trim()}
                              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                              {planEditing ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Updating plan…</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Apply changes</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trip summary */}
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <p className="text-amber-900 leading-relaxed">{itinerary.summary}</p>
                  </div>

                  {/* Current day */}
                  {currentDay && (
                    <div>
                      {userRole === 'owner' && (
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => setEditingDay(currentDay.day)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit this day
                          </button>
                        </div>
                      )}
                      <ItineraryDayComponent day={currentDay} travelTimes={travelTimes} />
                    </div>
                  )}

                  {/* Budget panel */}
                  {itinerary.budget_estimate && (
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setBudgetOpen(!budgetOpen)}
                        className="flex items-center justify-between w-full px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Budget Estimate</p>
                            <p className="text-sm text-slate-500">
                              ${itinerary.budget_estimate.low}–${itinerary.budget_estimate.high}{' '}
                              {itinerary.budget_estimate.currency}
                            </p>
                          </div>
                        </div>
                        {budgetOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {budgetOpen && (
                        <div className="px-5 pb-5 border-t border-stone-100">
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-stone-50 rounded-xl p-4">
                              <p className="text-xs text-slate-500 font-medium">Low estimate</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">
                                ${itinerary.budget_estimate.low}
                              </p>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4">
                              <p className="text-xs text-slate-500 font-medium">High estimate</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">
                                ${itinerary.budget_estimate.high}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Packing tips */}
                  {itinerary.packing_tips && itinerary.packing_tips.length > 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setPackingOpen(!packingOpen)}
                        className="flex items-center justify-between w-full px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-violet-600" />
                          </div>
                          <p className="font-semibold text-slate-900">Packing Tips</p>
                        </div>
                        {packingOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {packingOpen && (
                        <div className="px-5 pb-5 border-t border-stone-100">
                          <ul className="mt-4 space-y-2">
                            {itinerary.packing_tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                                <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column — sticky map */}
                {currentDay && (
                  <div className="hidden lg:block w-[460px] flex-shrink-0">
                    <div className="sticky top-[120px]">
                      <DayMap
                        day={currentDay}
                        onTravelTimes={setTravelTimes}
                        mapHeight="h-[calc(100vh-200px)]"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </>
      )}

      {/* Plan tab — no itinerary */}
      {activeTab === 'plan' && !itinerary && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-slate-500">No itinerary generated yet.</p>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PhotosTab
            tripId={trip.id}
            photos={photos}
            currentUserId={currentUserId}
            days={itinerary?.days.length ?? 0}
            onDelete={(photoId) => setPhotos((prev) => prev.filter((p) => p.id !== photoId))}
            onUpload={(photo) => setPhotos((prev) => prev.some((p) => p.id === photo.id) ? prev : [photo, ...prev])}
          />
        </div>
      )}

      {/* Brochure Tab */}
      {activeTab === 'brochure' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BrochureTab
            trip={trip}
            photos={photos.filter((p) => p.uploaded_by === currentUserId)}
          />
        </div>
      )}
    </div>
  )
}
