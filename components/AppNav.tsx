'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, LayoutDashboard, Plus, LogOut } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import config from '@/lib/config'
import { useState, useEffect, useRef } from 'react'

interface AppNavProps {
  user: { id: string; email?: string }
  profile: { full_name: string | null; avatar_url: string | null } | null
}

export default function AppNav({ user, profile }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name = profile?.full_name ?? user.email ?? 'User'
  const initials = getInitials(name)

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm shadow-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-stone-900">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">{config.appName}</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/trips/new"
            className="hidden sm:flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-stone-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-amber-200">
                  {initials}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg shadow-stone-200 border border-stone-100 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-900 truncate">{name}</p>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-stone-400" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
