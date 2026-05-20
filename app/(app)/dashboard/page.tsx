import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, MapPin, Compass } from 'lucide-react'
import TripCard from '@/components/TripCard'
import { Trip, TripMember } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch all trips the user is a member of
  const { data: memberRows } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', user.id)

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

    // Fetch all members for these trips
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="text-slate-500 mt-1">
            {trips.length === 0
              ? 'No trips yet — create your first one!'
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link
          href="/trips/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Trip
        </Link>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Plan your first trip</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Tell our AI where you want to go and it will create a complete itinerary in seconds.
            Invite friends, upload photos, and get a beautiful brochure at the end.
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create your first trip
          </Link>
        </div>
      )}

      {/* Active trips */}
      {activeTrips.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Planning</h2>
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
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Completed</h2>
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
