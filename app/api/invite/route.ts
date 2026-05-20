import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'
import config from '@/lib/config'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { trip_id, email } = await request.json()

  if (!trip_id || !email) {
    return NextResponse.json({ error: 'Missing trip_id or email' }, { status: 400 })
  }

  // Verify the user is an owner of this trip
  const { data: member } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', trip_id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    return NextResponse.json({ error: 'Only trip owners can invite members' }, { status: 403 })
  }

  // Get trip details
  const { data: trip } = await supabase
    .from('trips')
    .select('title')
    .eq('id', trip_id)
    .single()

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  // Check for existing invite
  const { data: existingInvite } = await supabase
    .from('trip_invites')
    .select('id, accepted')
    .eq('trip_id', trip_id)
    .eq('invited_email', email)
    .single()

  if (existingInvite?.accepted) {
    return NextResponse.json({ error: 'This person has already joined the trip' }, { status: 400 })
  }

  const token = uuidv4().replace(/-/g, '')

  const { data: invite, error: inviteError } = await supabase
    .from('trip_invites')
    .upsert({
      trip_id,
      invited_email: email,
      invite_token: token,
      accepted: false,
    })
    .select()
    .single()

  if (inviteError) {
    console.error('Invite error:', inviteError)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/join/${token}`

  // Send invite email via Resend if configured
  if (resend) {
    try {
      await resend.emails.send({
        from: config.fromEmail,
        to: email,
        subject: `You're invited to join "${trip.title}" on ${config.appName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You're invited!</h2>
            <p>You've been invited to join the trip <strong>${trip.title}</strong> on ${config.appName}.</p>
            <p>
              <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Accept Invite
              </a>
            </p>
            <p style="color: #64748b; font-size: 14px;">
              Or paste this link: ${inviteUrl}
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the request if email sending fails
    }
  }

  return NextResponse.json({ invite, invite_url: inviteUrl })
}
