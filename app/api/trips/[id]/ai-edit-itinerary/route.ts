import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { editItinerary } from '@/lib/claude'
import { Itinerary } from '@/lib/types'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authClient = await createClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('trip_members')
    .select('role')
    .eq('trip_id', id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can edit the itinerary' }, { status: 403 })
  }

  let body: { prompt: string; currentItinerary: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { prompt, currentItinerary } = body
  if (!prompt || !currentItinerary) {
    return NextResponse.json({ error: 'Missing prompt or currentItinerary' }, { status: 400 })
  }

  try {
    const updatedItinerary = await editItinerary(currentItinerary as Itinerary, prompt)

    const { error } = await admin
      .from('trips')
      .update({ itinerary: updatedItinerary })
      .eq('id', id)

    if (error) throw new Error('Failed to save itinerary')

    return NextResponse.json({ itinerary: updatedItinerary })
  } catch (err) {
    console.error('AI edit itinerary error:', err)
    return NextResponse.json({ error: 'AI edit failed' }, { status: 500 })
  }
}
