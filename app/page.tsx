import Link from 'next/link'
import { MapPin, Sparkles, Users, Camera, BookOpen, ArrowRight, Star } from 'lucide-react'
import config from '@/lib/config'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Planning',
    description:
      'Describe your dream trip in plain English. Our AI generates a complete day-by-day itinerary with real places, costs, and insider tips.',
    color: 'bg-violet-500/20 text-violet-400',
  },
  {
    icon: Users,
    title: 'Plan Together',
    description:
      'Invite friends and family. Everyone sees the same trip, uploads photos live, and stays in sync — no group chats needed.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: Camera,
    title: 'Capture Memories',
    description:
      'Upload photos during the trip. They appear instantly for all members, building your shared album as you go.',
    color: 'bg-rose-500/20 text-rose-400',
  },
  {
    icon: BookOpen,
    title: 'Beautiful Brochure',
    description:
      "When the trip ends, get a personalized PDF brochure with your photos, highlights, and memories. A keepsake you'll love forever.",
    color: 'bg-amber-500/20 text-amber-400',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Travel enthusiast',
    quote: 'TripMemo planned our Japan trip in 2 minutes. Every recommendation was perfect — felt like a local friend planned it.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Rivera',
    role: 'Adventure traveler',
    quote: 'The collaboration feature is a game changer. My whole group could see updates in real time. No more WhatsApp chaos!',
    avatar: 'MR',
  },
  {
    name: 'Priya Patel',
    role: 'Family travel planner',
    quote: 'The PDF brochure brought tears to my eyes. It captured our family trip so beautifully. Worth every penny.',
    avatar: 'PP',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">{config.appName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Plan trips that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              feel like magic
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your dream trip. Get a stunning day-by-day itinerary in seconds. Collaborate
            with friends in real time. Relive it all in a beautiful brochure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start planning for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-slate-500 text-sm">No credit card required</p>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-4xl mx-auto mt-20">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 bg-slate-700 rounded-md h-6" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Day 1 — Mountains', 'Day 2 — City', 'Day 3 — Coast'].map((day, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/80 rounded-xl p-4 border border-white/5 space-y-3"
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        background: ['#2D6A4F', '#1E40AF', '#0E7490'][i],
                        width: '60%',
                      }}
                    />
                    <p className="text-sm font-semibold text-white">{day}</p>
                    <div className="space-y-2">
                      {[1, 2].map((j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <div className="h-2 bg-slate-700 rounded-full flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to travel better</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From planning to memories, {config.appName} handles every part of your journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Plan a trip in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell us your trip',
                desc: 'Enter destinations, dates, and what you love. Beach hiker? Culture vulture? Foodie? We\'ve got you.',
                color: 'text-blue-400',
              },
              {
                step: '02',
                title: 'AI plans everything',
                desc: 'Claude AI generates a full itinerary with real places, costs, maps, and tips. In under 30 seconds.',
                color: 'text-violet-400',
              },
              {
                step: '03',
                title: 'Share and explore',
                desc: 'Invite your crew, upload photos as you go, and download a beautiful brochure at the end.',
                color: 'text-emerald-400',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`text-6xl font-black ${item.color} opacity-30 mb-4`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by travelers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-blue-600/20 border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Your next adventure starts here</h2>
            <p className="text-slate-400 text-lg mb-8">
              Join thousands of travelers planning smarter, together.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start planning for free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{config.appName} — {config.appTagline}</span>
          </div>
          <p className="text-slate-600 text-xs">Built with Claude AI by Anthropic</p>
        </div>
      </footer>
    </div>
  )
}
