import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateItinerary } from '@/lib/claude'
import { PlanTripInput } from '@/lib/types'

export async function POST(request: Request) {
  const authClient = await createClient()
  const supabase = createAdminClient()

  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PlanTripInput & { title?: string; description?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { destinations, start_date, end_date, travelers, preferences, budget } = body

  if (!destinations?.length || !start_date || !end_date || !travelers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const itinerary = await generateItinerary({
      destinations,
      start_date,
      end_date,
      travelers,
      preferences: preferences ?? '',
      budget,
    })

    // Create the trip record
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title: itinerary.trip_title,
        description: itinerary.summary,
        destinations,
        start_date,
        end_date,
        status: 'planning',
        itinerary,
        created_by: user.id,
      })
      .select()
      .single()

    if (tripError) {
      console.error('Trip insert error:', tripError)
      return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 })
    }

    // Add user as owner in trip_members
    const { error: memberError } = await supabase.from('trip_members').insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      console.error('Member insert error:', memberError)
      // Don't fail the whole request — trip was created
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Plan trip error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate itinerary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
