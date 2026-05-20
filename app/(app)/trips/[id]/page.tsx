import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Trip, TripMember, TripPhoto } from '@/lib/types'
import TripPageClient from './TripPageClient'

interface TripPageProps {
  params: Promise<{ id: string }>
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Verify membership
  const { data: memberCheck } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', id)
    .eq('user_id', user.id)
    .single()

  if (!memberCheck) notFound()

  // Fetch trip
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !trip) notFound()

  // Fetch members with user profiles
  const { data: members } = await supabase
    .from('trip_members')
    .select('*, user:users(id, full_name, avatar_url)')
    .eq('trip_id', id)

  // Fetch photos with uploader info
  const { data: photos } = await supabase
    .from('trip_photos')
    .select('*, uploader:users(id, full_name, avatar_url)')
    .eq('trip_id', id)
    .order('uploaded_at', { ascending: false })

  // Get public URLs for photos
  const photosWithUrls = (photos ?? []).map((photo) => {
    const { data } = supabase.storage
      .from('trip-photos')
      .getPublicUrl(photo.storage_path)
    return { ...photo, public_url: data.publicUrl }
  })

  return (
    <TripPageClient
      trip={trip as Trip}
      members={(members ?? []) as TripMember[]}
      photos={photosWithUrls as TripPhoto[]}
      currentUserId={user.id}
      userRole={memberCheck.role}
    />
  )
}
