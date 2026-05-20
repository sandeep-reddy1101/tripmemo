'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trip, TripMember, TripPhoto } from '@/lib/types'
import { formatDateRange, getDestinationGradient } from '@/lib/utils'
import { MapPin, Calendar, Users, UserPlus, Settings, Camera, BookOpen, Map, Package, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import CollaboratorAvatars from '@/components/CollaboratorAvatars'
import DaySelector from '@/components/DaySelector'
import ItineraryDayComponent from '@/components/ItineraryDay'
import PhotosTab from './PhotosTab'
import BrochureTab from './BrochureTab'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  const itinerary = trip.itinerary
  const gradient = getDestinationGradient(trip.destinations ?? [])
  const currentDay = itinerary?.days.find((d) => d.day === activeDay)

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

          const { data: urlData } = supabase.storage
            .from('trip-photos')
            .getPublicUrl(newPhoto.storage_path)

          const uploaderWithCreatedAt = uploader
            ? { ...uploader, created_at: '' }
            : undefined

          setPhotos((prev) => [
            { ...newPhoto, uploader: uploaderWithCreatedAt, public_url: urlData.publicUrl },
            ...prev,
          ])
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
      {/* Hero Banner */}
      <div className={`relative h-64 sm:h-80 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {trip.cover_image_url && (
          <img
            src={trip.cover_image_url}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    trip.status === 'active'
                      ? 'bg-green-500/80 text-white'
                      : trip.status === 'completed'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-500/80 text-white'
                  }`}
                >
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                {trip.title}
              </h1>
              <div className="flex items-center flex-wrap gap-4 mt-2 text-white/80 text-sm">
                {trip.destinations && trip.destinations.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {trip.destinations.join(' → ')}
                  </span>
                )}
                {trip.start_date && trip.end_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <CollaboratorAvatars members={members} maxVisible={4} size="md" />
              {userRole === 'owner' && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/trips/${trip.id}/invite`}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
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

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Trip summary */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <p className="text-blue-800 leading-relaxed">{itinerary.summary}</p>
            </div>

            {/* Current day */}
            {currentDay && <ItineraryDayComponent day={currentDay} />}

            {/* Budget panel */}
            {itinerary.budget_estimate && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-medium">Low estimate</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          ${itinerary.budget_estimate.low}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
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
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <ul className="mt-4 space-y-2">
                      {itinerary.packing_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-violet-500 mt-0.5 flex-shrink-0">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
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
