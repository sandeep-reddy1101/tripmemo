import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const tripId = formData.get('tripId') as string | null
  const caption = (formData.get('caption') as string) ?? null
  const dayNumberStr = formData.get('dayNumber') as string | null
  const dayNumber = dayNumberStr ? parseInt(dayNumberStr, 10) : null

  if (!file || !tripId) {
    return NextResponse.json({ error: 'Missing file or tripId' }, { status: 400 })
  }

  // Verify user is a member of the trip
  const { data: member } = await supabase
    .from('trip_members')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 })
  }

  // Validate file type and size (10MB max)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP or GIF.' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  const storagePath = `${tripId}/${user.id}/${timestamp}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('trip-photos')
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  const { data: photo, error: dbError } = await supabase
    .from('trip_photos')
    .insert({
      trip_id: tripId,
      uploaded_by: user.id,
      storage_path: storagePath,
      caption: caption || null,
      day_number: dayNumber,
    })
    .select()
    .single()

  if (dbError) {
    console.error('Photo DB error:', dbError)
    // Attempt to clean up the uploaded file
    await supabase.storage.from('trip-photos').remove([storagePath])
    return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('trip-photos')
    .getPublicUrl(storagePath)

  return NextResponse.json({ photo, public_url: urlData.publicUrl })
}
