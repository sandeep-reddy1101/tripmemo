import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Check } from 'lucide-react'

interface JoinPageProps {
  params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch the invite
  const { data: invite } = await supabase
    .from('trip_invites')
    .select('*, trip:trips(id, title, destinations)')
    .eq('invite_token', token)
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg">Invalid or expired invite link.</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 underline mt-4 block">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  if (invite.accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-lg mb-4">This invite has already been used.</p>
          <Link
            href={user ? `/trips/${invite.trip_id}` : '/auth/login'}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {user ? 'Go to trip' : 'Sign in'}
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to signup with the token in the callback URL
    redirect(`/auth/signup?redirectTo=/join/${token}`)
  }

  // Accept the invite
  const { error: updateError } = await supabase
    .from('trip_invites')
    .update({ accepted: true })
    .eq('invite_token', token)

  if (!updateError) {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', invite.trip_id)
      .eq('user_id', user.id)
      .single()

    if (!existingMember) {
      await supabase.from('trip_members').insert({
        trip_id: invite.trip_id,
        user_id: user.id,
        role: 'collaborator',
      })
    }

    redirect(`/trips/${invite.trip_id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">You&apos;re in!</h2>
          <p className="text-slate-400 mb-6">
            You&apos;ve joined{' '}
            <span className="text-white font-semibold">{invite.trip?.title}</span>.
          </p>
          <Link
            href={`/trips/${invite.trip_id}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <MapPin className="w-5 h-5" />
            View the trip
          </Link>
        </div>
      </div>
    </div>
  )
}
