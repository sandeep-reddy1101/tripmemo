import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { editDay } from '@/lib/claude'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authClient = await createClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { prompt: string; currentDay: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { prompt, currentDay } = body
  if (!prompt || !currentDay) {
    return NextResponse.json({ error: 'Missing prompt or currentDay' }, { status: 400 })
  }

  try {
    const modifiedDay = await editDay(currentDay as Parameters<typeof editDay>[0], prompt)
    return NextResponse.json({ day: modifiedDay })
  } catch (err) {
    console.error('AI edit day error:', err)
    return NextResponse.json({ error: 'AI edit failed' }, { status: 500 })
  }
}
