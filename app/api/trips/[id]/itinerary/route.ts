import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authClient = await createClient()
  const supabase = createAdminClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: member } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can edit the itinerary' }, { status: 403 })
  }

  const { itinerary } = await request.json()

  const { error } = await supabase.from('trips').update({ itinerary }).eq('id', id)

  if (error) {
    console.error('Itinerary save error:', error)
    return NextResponse.json({ error: 'Failed to save itinerary' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
