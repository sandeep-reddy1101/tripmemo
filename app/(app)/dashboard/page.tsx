import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, Compass, MapPin } from 'lucide-react'
import TripCard from '@/components/TripCard'
import { Trip, TripMember } from '@/lib/types'

function getGreeting(): string {
  const hour = new Date().getUTCHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: memberRows }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    supabase.from('trip_members').select('trip_id').eq('user_id', user.id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const tripIds = (memberRows ?? []).map((r) => r.trip_id)

  let trips: Trip[] = []
  let membersByTrip: Record<string, TripMember[]> = {}

  if (tripIds.length > 0) {
    const { data: tripData } = await supabase
      .from('trips')
      .select('*')
      .in('id', tripIds)
      .order('created_at', { ascending: false })

    trips = (tripData ?? []) as Trip[]

    const { data: allMembers } = await supabase
      .from('trip_members')
      .select('*, user:users(id, full_name, avatar_url)')
      .in('trip_id', tripIds)

    for (const member of allMembers ?? []) {
      if (!membersByTrip[member.trip_id]) membersByTrip[member.trip_id] = []
      membersByTrip[member.trip_id].push(member as TripMember)
    }
  }

  const planningTrips = trips.filter((t) => t.status === 'planning')
  const activeTrips = trips.filter((t) => t.status === 'active')
  const completedTrips = trips.filter((t) => t.status === 'completed')

  return (
    <div>
      {/* ── Greeting banner ── */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 border border-amber-100 rounded-2xl px-7 py-6 mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900">
              {getGreeting()}{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {trips.length === 0
                ? 'Ready to plan your next adventure?'
                : activeTrips.length > 0
                ? `You have ${activeTrips.length} trip${activeTrips.length !== 1 ? 's' : ''} happening right now ✈️`
                : `${trips.length} trip${trips.length !== 1 ? 's' : ''} in your collection`}
            </p>
          </div>
        </div>
        <Link
          href="/trips/new"
          className="flex-shrink-0 flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-14 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <Compass className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Plan your first trip</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
            Tell our AI where you want to go and it will create a complete itinerary in seconds.
            Invite friends, upload photos, and get a beautiful brochure at the end.
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-amber-200"
          >
            <Plus className="w-5 h-5" />
            Create your first trip
          </Link>
        </div>
      )}

      {/* Active trips */}
      {activeTrips.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Happening now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} members={membersByTrip[trip.id] ?? []} />
            ))}
          </div>
        </section>
      )}

      {/* Planning trips */}
      {planningTrips.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
            Planning
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {planningTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} members={membersByTrip[trip.id] ?? []} />
            ))}
          </div>
        </section>
      )}

      {/* Completed trips */}
      {completedTrips.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
            Completed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} members={membersByTrip[trip.id] ?? []} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
