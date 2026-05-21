'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Mail, Lock, Loader2 } from 'lucide-react'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import config from '@/lib/config'

const decorativeCards = [
  { gradient: 'from-amber-500 to-orange-600', dest: 'Kyoto', day: 'Day 1', rotate: 'rotate-3' },
  { gradient: 'from-teal-500 to-emerald-600', dest: 'Santorini', day: 'Day 3', rotate: '-rotate-2' },
  { gradient: 'from-rose-500 to-pink-600', dest: 'Bali', day: 'Day 5', rotate: 'rotate-1' },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) { setError('Please enter your email address first.'); return }
    setMagicLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    })
    if (error) { setError(error.message) } else { setMagicSent(true) }
    setMagicLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel (lg+) ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-stone-950 relative overflow-hidden flex-col">
        {/* Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/25 via-stone-950 to-stone-950" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-700/8 rounded-full blur-3xl" />

        {/* Brand */}
        <div className="relative p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">{config.appName}</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-12 pb-12">
          <blockquote className="text-2xl text-white font-medium leading-relaxed text-center mb-12">
            &ldquo;Every great adventure<br />starts with a plan.&rdquo;
          </blockquote>

          {/* Stacked mini destination cards */}
          <div className="relative w-56 h-44">
            {decorativeCards.map((card, i) => (
              <div
                key={i}
                className={`absolute inset-0 transform ${card.rotate}`}
                style={{ zIndex: i + 1 }}
              >
                <div className={`w-52 bg-gradient-to-br ${card.gradient} rounded-xl p-4 shadow-xl`}>
                  <p className="text-white/70 text-xs">{card.day}</p>
                  <p className="text-white font-bold text-lg">{card.dest}</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 bg-white/25 rounded-full w-3/4" />
                    <div className="h-1.5 bg-white/15 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-10 pb-8 text-stone-600 text-xs">
          Trusted by thousands of travelers worldwide
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-amber-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-stone-900 tracking-tight">{config.appName}</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 mb-1.5">Welcome back</h1>
            <p className="text-stone-500">Sign in to continue planning adventures</p>
          </div>

          {magicSent ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-stone-900 text-lg font-semibold mb-2">Check your inbox</h2>
              <p className="text-stone-500 text-sm">
                We sent a magic link to <span className="text-amber-600 font-medium">{email}</span>.
              </p>
              <button onClick={() => setMagicSent(false)} className="mt-4 text-amber-600 hover:text-amber-500 text-sm underline">
                Use password instead
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <GoogleAuthButton redirectTo={redirectTo} label="Continue with Google" />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-stone-400">or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-stone-200 text-stone-900 placeholder-stone-400 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full border border-stone-200 text-stone-900 placeholder-stone-400 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-amber-200"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={magicLoading}
                  className="w-full bg-stone-50 hover:bg-stone-100 disabled:opacity-60 border border-stone-200 text-stone-600 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {magicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send magic link instead
                </button>
              </form>

              <p className="text-center text-stone-500 text-sm">
                No account?{' '}
                <Link href="/auth/signup" className="text-amber-600 hover:text-amber-500 font-medium">
                  Sign up free
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
