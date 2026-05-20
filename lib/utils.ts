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
    'from-emerald-400 via-teal-500 to-cyan-600',
    'from-violet-500 via-purple-500 to-indigo-600',
    'from-orange-400 via-amber-500 to-yellow-500',
    'from-pink-400 via-rose-500 to-red-500',
    'from-blue-400 via-sky-500 to-cyan-500',
  ]
  const index = destinations.length % gradients.length
  return gradients[index]
}

export function generateInviteToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
