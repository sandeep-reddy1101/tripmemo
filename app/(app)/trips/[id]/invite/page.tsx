import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvitePageClient from './InvitePageClient'

interface InvitePageProps {
  params: Promise<{ id: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Only owners can invite
  const { data: member } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') notFound()

  const { data: trip } = await supabase
    .from('trips')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!trip) notFound()

  const { data: invites } = await supabase
    .from('trip_invites')
    .select('*')
    .eq('trip_id', id)
    .order('created_at', { ascending: false })

  return (
    <InvitePageClient
      tripId={id}
      tripTitle={trip.title}
      existingInvites={invites ?? []}
    />
  )
}
