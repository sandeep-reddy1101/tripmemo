import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBrochureNarrative } from '@/lib/claude'
import { Itinerary } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { trip_id } = await request.json()

  if (!trip_id) {
    return NextResponse.json({ error: 'Missing trip_id' }, { status: 400 })
  }

  // Verify membership
  const { data: member } = await supabase
    .from('trip_members')
    .select('id')
    .eq('trip_id', trip_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 })
  }

  const { data: trip } = await supabase
    .from('trips')
    .select('title, destinations, itinerary')
    .eq('id', trip_id)
    .single()

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  if (!trip.itinerary) {
    return NextResponse.json({ error: 'Trip has no itinerary' }, { status: 400 })
  }

  try {
    const brochure = await generateBrochureNarrative(
      trip.title,
      trip.destinations ?? [],
      trip.itinerary as Itinerary
    )

    return NextResponse.json({ brochure })
  } catch (error) {
    console.error('Brochure generation error:', error)
    return NextResponse.json({ error: 'Failed to generate brochure narrative' }, { status: 500 })
  }
}
