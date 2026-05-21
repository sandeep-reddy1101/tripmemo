import Link from 'next/link'
import { MapPin, Sparkles, Users, Camera, BookOpen, ArrowRight, Star, Compass } from 'lucide-react'
import config from '@/lib/config'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Travel enthusiast',
    quote: 'TripMemo planned our Japan trip in 2 minutes. Every recommendation was perfect — felt like a local friend planned it.',
    avatar: 'SC',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Marcus Rivera',
    role: 'Adventure traveler',
    quote: 'The collaboration feature is a game changer. My whole group could see updates in real time. No more WhatsApp chaos!',
    avatar: 'MR',
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    name: 'Priya Patel',
    role: 'Family travel planner',
    quote: 'The PDF brochure brought tears to my eyes. It captured our family trip so beautifully. Worth every penny.',
    avatar: 'PP',
    gradient: 'from-rose-500 to-orange-500',
  },
]

const mockCards = [
  {
    gradient: 'from-amber-500 to-orange-600',
    day: 'Day 1',
    destination: 'Kyoto',
    tag: 'Temples & Culture',
    rotate: 'rotate-6 translate-x-3 -translate-y-2',
    zIndex: 'z-10',
  },
  {
    gradient: 'from-teal-500 to-emerald-600',
    day: 'Day 2',
    destination: 'Osaka',
    tag: 'Street Food Tour',
    rotate: '-rotate-3 translate-x-1 translate-y-3',
    zIndex: 'z-20',
  },
  {
    gradient: 'from-rose-500 to-pink-600',
    day: 'Day 3',
    destination: 'Nara',
    tag: 'Nature & Wildlife',
    rotate: 'rotate-1',
    zIndex: 'z-30',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">{config.appName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
              Sign in
            </Link>
            <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center pt-16 overflow-hidden">
        {/* Warm ambient glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/12 via-stone-950 to-stone-950 pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center py-20">

            {/* Left: Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <Sparkles className="w-4 h-4" />
                Powered by Claude AI
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Plan trips that{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  feel like magic
                </span>
              </h1>

              <p className="text-xl text-stone-400 mb-10 leading-relaxed">
                Describe your dream trip. Get a stunning day-by-day itinerary in seconds. Collaborate
                with friends. Relive it all in a beautiful brochure.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/30 text-base"
                >
                  Start planning for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base"
                >
                  Sign in
                </Link>
              </div>

              <div className="flex items-center gap-6 text-stone-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="flex -space-x-1">
                    {['from-amber-500 to-orange-600','from-teal-500 to-emerald-600','from-rose-500 to-pink-600'].map((g,i) => (
                      <span key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-stone-950 inline-block`} />
                    ))}
                  </span>
                  <span>10k+ trips planned</span>
                </span>
                <span>·</span>
                <span>No credit card required</span>
              </div>
            </div>

            {/* Right: Stacked destination cards */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-72 h-[440px]">
                {mockCards.map((card, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transform ${card.rotate} ${card.zIndex}`}
                  >
                    <div className="w-64 bg-stone-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                      <div className={`bg-gradient-to-br ${card.gradient} px-5 py-4`}>
                        <p className="text-white/70 text-xs font-medium">{card.day}</p>
                        <h3 className="text-white font-bold text-xl mt-0.5">{card.destination}</h3>
                        <span className="inline-block mt-1.5 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                          {card.tag}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/8 flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="h-2 bg-stone-700 rounded-full" style={{ width: `${65 + j * 10}%` }} />
                              <div className="h-1.5 bg-stone-800 rounded-full w-2/5" />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <div className="bg-stone-800 rounded-lg px-3 py-1.5 flex gap-1.5 items-center">
                            <div className="w-2 h-2 rounded-full bg-stone-600" />
                            <div className="h-1.5 w-10 bg-stone-600 rounded" />
                          </div>
                          <div className="bg-stone-800 rounded-lg px-3 py-1.5 flex gap-1.5 items-center">
                            <div className="w-2 h-2 rounded-full bg-stone-600" />
                            <div className="h-1.5 w-8 bg-stone-600 rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Everything you need to travel better</h2>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              From planning to memories, {config.appName} handles every part of your journey.
            </p>
          </div>

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {/* AI Planning — wide */}
            <div className="md:col-span-4 bg-stone-900 border border-white/5 rounded-2xl p-8 hover:border-amber-500/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-amber-200 transition-colors">AI-Powered Planning</h3>
              <p className="text-stone-400 leading-relaxed mb-6">
                Describe your dream trip in plain English. Our AI generates a complete day-by-day itinerary
                with real places, costs, and insider tips — in under 30 seconds.
              </p>
              {/* Mock input */}
              <div className="bg-stone-800/60 rounded-xl px-4 py-3 border border-white/5 text-sm text-stone-500 italic">
                &ldquo;10 days in Japan, food lover, off the beaten path, moderate budget…&rdquo;
              </div>
              <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Generating your itinerary…
              </div>
            </div>

            {/* Plan Together */}
            <div className="md:col-span-3 bg-stone-900 border border-white/5 rounded-2xl p-7 hover:border-teal-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-teal-200 transition-colors">Plan Together</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-5">
                Invite friends and family. Everyone sees the same trip, uploads photos live, and stays in sync.
              </p>
              {/* Mock avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['from-amber-500 to-orange-600','from-teal-500 to-emerald-600','from-rose-500 to-pink-600','from-sky-500 to-blue-600'].map((g,i) => (
                    <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-2 border-stone-900`} />
                  ))}
                </div>
                <span className="text-stone-400 text-sm">4 people planning</span>
              </div>
            </div>

            {/* Capture Memories */}
            <div className="md:col-span-3 bg-stone-900 border border-white/5 rounded-2xl p-7 hover:border-rose-500/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-5">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-rose-200 transition-colors">Capture Memories</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-5">
                Upload photos during the trip. They appear instantly for all members, building your shared album.
              </p>
              {/* Mock photo grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {['from-amber-600 to-orange-700','from-teal-600 to-emerald-700','from-rose-600 to-pink-700',
                  'from-sky-600 to-blue-700','from-violet-600 to-purple-700','from-amber-500 to-yellow-600'].map((g,i) => (
                  <div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${g} opacity-70`} />
                ))}
              </div>
            </div>

            {/* Beautiful Brochure — wide */}
            <div className="md:col-span-4 bg-stone-900 border border-white/5 rounded-2xl p-8 hover:border-orange-500/20 transition-all group relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl" />
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-orange-200 transition-colors">Beautiful Brochure</h3>
              <p className="text-stone-400 leading-relaxed mb-5">
                When the trip ends, get a personalized PDF keepsake with your photos, highlights, and memories. A souvenir you&apos;ll treasure forever.
              </p>
              <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                PDF · Photo book · Shareable
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-stone-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Plan a trip in 3 steps</h2>
            <p className="text-stone-400">From idea to itinerary in under a minute.</p>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-7 left-[calc(16.7%+1.75rem)] right-[calc(16.7%+1.75rem)] h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  n: 1,
                  title: 'Tell us your trip',
                  desc: "Enter destinations, dates, and what you love. Beach hiker? Culture vulture? Foodie? We've got you.",
                  color: 'text-amber-400',
                  ring: 'border-amber-500/40 bg-amber-500/10',
                },
                {
                  n: 2,
                  title: 'AI plans everything',
                  desc: 'Claude AI generates a full itinerary with real places, costs, maps, and tips. In under 30 seconds.',
                  color: 'text-orange-400',
                  ring: 'border-orange-500/40 bg-orange-500/10',
                },
                {
                  n: 3,
                  title: 'Share and explore',
                  desc: 'Invite your crew, upload photos as you go, and download a beautiful brochure at the end.',
                  color: 'text-teal-400',
                  ring: 'border-teal-500/40 bg-teal-500/10',
                },
              ].map((item) => (
                <div key={item.n} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full border-2 ${item.ring} flex items-center justify-center mb-6 relative z-10`}>
                    <span className={`text-xl font-bold ${item.color}`}>{item.n}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Loved by travelers</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="text-stone-400 text-sm ml-2">4.9 / 5 from 2,400+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-stone-900 border border-white/5 rounded-2xl p-7 hover:border-amber-500/15 transition-colors flex flex-col">
                {/* Large quote mark */}
                <div className="text-5xl text-amber-500/30 font-serif leading-none mb-3">&ldquo;</div>
                <p className="text-stone-300 leading-relaxed flex-1 text-[15px]">{t.quote}</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-stone-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-amber-900/40 via-orange-900/20 to-stone-900/60 border border-amber-500/15 rounded-3xl p-14 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <Compass className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Your next adventure starts here</h2>
              <p className="text-stone-400 text-lg mb-10 max-w-lg mx-auto">
                Join thousands of travelers planning smarter, together.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold px-9 py-4 rounded-xl transition-all text-lg shadow-xl shadow-amber-900/40"
              >
                Start planning for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-stone-600 text-sm mt-5">No credit card required · Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-400">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-sm">{config.appName} — {config.appTagline}</span>
          </div>
          <p className="text-stone-600 text-xs">Built with Claude AI by Anthropic</p>
        </div>
      </footer>
    </div>
  )
}
