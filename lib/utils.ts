import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy') {
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatDateRange(startDate: string, endDate: string) {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
    }
    return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`
  } catch {
    return `${startDate} – ${endDate}`
  }
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    nature: '🏔',
    food: '🍽',
    culture: '🎭',
    adventure: '⚡',
    shopping: '🛍',
    other: '📍',
  }
  return icons[category] ?? '📍'
}

export function getMapsEmbedUrl(query: string): string {
  const encoded = encodeURIComponent(query)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return ''
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encoded}`
}

export function getMapsDirectionsUrl(query: string): string {
  const encoded = encodeURIComponent(query)
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`
}

export function getDestinationGradient(destinations: string[]): string {
  const gradients = [
    'from-amber-500 via-orange-500 to-red-600',      // Desert sunset
    'from-teal-500 via-emerald-500 to-green-600',    // Tropical jungle
    'from-sky-500 via-cyan-500 to-teal-600',         // Ocean coast
    'from-rose-500 via-pink-500 to-orange-500',      // Sakura / warm dusk
    'from-amber-400 via-yellow-500 to-orange-500',   // Golden savanna
    'from-emerald-600 via-teal-600 to-cyan-700',     // Deep rainforest
  ]
  const index = (destinations.join('').length) % gradients.length
  return gradients[index]
}

export function generateInviteToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
