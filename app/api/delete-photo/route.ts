import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  const { photoId } = await request.json()
  if (!photoId) return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })

  const authClient = await createClient()
  const supabase = createAdminClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: photo } = await supabase
    .from('trip_photos')
    .select('id, storage_path, uploaded_by')
    .eq('id', photoId)
    .single()

  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  if (photo.uploaded_by !== user.id) {
    return NextResponse.json({ error: 'Only the uploader can delete this photo' }, { status: 403 })
  }

  await supabase.storage.from('trip-photos').remove([photo.storage_path])

  const { error } = await supabase.from('trip_photos').delete().eq('id', photoId)
  if (error) return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })

  return NextResponse.json({ success: true })
}
