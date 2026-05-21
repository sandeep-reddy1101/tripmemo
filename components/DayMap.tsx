/// <reference types="@types/google.maps" />
'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { ItineraryDay } from '@/lib/types'
import { Car, Footprints, Loader2, AlertCircle } from 'lucide-react'

// Store the flag on window so HMR module re-evaluation doesn't reset it
function configureMapsLoader(apiKey: string) {
  if (typeof window === 'undefined') return
  const w = window as Window & { __mapsLoaderConfigured?: boolean }
  if (w.__mapsLoaderConfigured) return
  setOptions({ key: apiKey, v: 'weekly' })
  w.__mapsLoaderConfigured = true
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h} hr ${m} min` : `${m} min`
}

type TravelMode = 'WALKING' | 'DRIVING'

interface DayMapProps {
  day: ItineraryDay
  onTravelTimes?: (times: string[]) => void
  mapHeight?: string
}

export default function DayMap({ day, onTravelTimes, mapHeight = 'h-80' }: DayMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  // Route.createPolylines returns an array
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING')

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local to enable the map.')
      setLoading(false)
      return
    }
    if (!mapRef.current || day.locations.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    configureMapsLoader(apiKey)

    Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('routes'),
    ])
      .then(async () => {
        if (!mapRef.current) return

        const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID'

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            zoom: 13,
            mapId,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
            gestureHandling: 'cooperative',
          })
        }

        const map = mapInstanceRef.current!

        markersRef.current.forEach((m) => { m.map = null })
        markersRef.current = []
        polylinesRef.current.forEach((p) => p.setMap(null))
        polylinesRef.current = []

        const makeMarker = (
          pos: google.maps.LatLngLiteral,
          index: number,
          loc: (typeof day.locations)[0],
        ) => {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding:2px 0;min-width:150px">
              <p style="font-weight:600;font-size:13px;margin:0 0 3px;color:#0f172a">${loc.name}</p>
              <p style="font-size:11px;color:#64748b;margin:0">${loc.time} · ${loc.duration}</p>
              ${loc.cost_estimate ? `<p style="font-size:11px;color:#64748b;margin:3px 0 0">${loc.cost_estimate}</p>` : ''}
            </div>`,
          })

          const pin = document.createElement('div')
          pin.style.cssText = [
            'width:28px;height:28px;border-radius:50%',
            `background:${day.color};border:2.5px solid white`,
            'color:white;font-size:11px;font-weight:700',
            'display:flex;align-items:center;justify-content:center',
            'box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer',
          ].join(';')
          pin.textContent = String(index + 1)

          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: pos,
            map,
            title: loc.name,
            content: pin,
          })
          marker.addListener('gmp-click', () => infoWindow.open({ anchor: marker, map }))
          return marker
        }

        // Single location — geocode and center
        if (day.locations.length === 1) {
          await importLibrary('geocoding')
          const geocoder = new google.maps.Geocoder()
          try {
            const { results } = await geocoder.geocode({ address: day.locations[0].maps_query })
            if (results[0]) {
              const pos = results[0].geometry.location
              map.setCenter(pos)
              map.setZoom(15)
              markersRef.current.push(makeMarker({ lat: pos.lat(), lng: pos.lng() }, 0, day.locations[0]))
            }
          } catch {
            setError('Could not geocode location.')
          }
          onTravelTimes?.([])
          setLoading(false)
          return
        }

        // Multiple locations — compute route with Routes API
        try {
          const response = await google.maps.routes.Route.computeRoutes({
            // string is accepted directly for origin/destination/Waypoint.location
            origin: day.locations[0].maps_query,
            destination: day.locations[day.locations.length - 1].maps_query,
            intermediates: day.locations.slice(1, -1).map((loc) => ({
              location: loc.maps_query,
            })),
            travelMode,  // 'WALKING' | 'DRIVING' — same values as old API
            fields: ['*'],
          })

          const route = response.routes?.[0]
          if (!route) throw new Error('No route returned')

          const legs = route.legs ?? []

          // Use the function form so we override the default dash-pattern icons
          // that createPolylines applies for WALKING mode
          polylinesRef.current = route.createPolylines({
            polylineOptions: (_defaults) => ({
              strokeColor: day.color,
              strokeWeight: 5,
              strokeOpacity: 0.8,
              icons: [],  // clear any dash/dot patterns
              map,
            }),
          })

          // durationMillis is ms — DirectionalLocation implements LatLngLiteral (.lat/.lng)
          onTravelTimes?.(legs.map((leg) => formatDuration(leg.durationMillis ?? 0)))

          const bounds = new google.maps.LatLngBounds()
          legs.forEach((leg, i) => {
            const loc = leg.startLocation
            if (!loc) return
            const pos: google.maps.LatLngLiteral = { lat: loc.lat, lng: loc.lng }
            bounds.extend(pos)
            markersRef.current.push(makeMarker(pos, i, day.locations[i]))
          })
          const lastLoc = legs[legs.length - 1]?.endLocation
          if (lastLoc) {
            const pos: google.maps.LatLngLiteral = { lat: lastLoc.lat, lng: lastLoc.lng }
            bounds.extend(pos)
            markersRef.current.push(
              makeMarker(pos, day.locations.length - 1, day.locations[day.locations.length - 1]),
            )
          }

          map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
          setLoading(false)
        } catch {
          setError('Could not load route. Make sure Routes API is enabled on your Google Cloud key.')
          setLoading(false)
        }
      })
      .catch(() => {
        setError('Failed to load Google Maps. Check your API key.')
        setLoading(false)
      })

    return () => {
      markersRef.current.forEach((m) => { m.map = null })
      polylinesRef.current.forEach((p) => p.setMap(null))
    }
    // day.day ensures the effect re-runs when switching days even if location count stays the same
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.day, day.locations, day.color, travelMode])

  if (day.locations.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="relative">
        <div ref={mapRef} className={`w-full ${mapHeight} ${error ? 'hidden' : ''}`} />

        {loading && !error && (
          <div className={`absolute inset-0 ${mapHeight} flex flex-col items-center justify-center gap-2 bg-slate-50`}>
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <p className="text-xs text-slate-500">Loading route…</p>
          </div>
        )}

        {error && (
          <div className={`${mapHeight} flex flex-col items-center justify-center gap-2 px-6 text-center bg-slate-50`}>
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!error && (
          <div className="absolute top-3 right-3 z-10 flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1 gap-0.5">
            <button
              onClick={() => setTravelMode('WALKING')}
              title="Walking"
              className={`p-1.5 rounded-lg transition-colors ${
                travelMode === 'WALKING'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTravelMode('DRIVING')}
              title="Driving"
              className={`p-1.5 rounded-lg transition-colors ${
                travelMode === 'DRIVING'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Location legend */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-t border-slate-100 flex-wrap">
        {day.locations.map((loc, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: day.color, fontSize: '10px' }}
            >
              {i + 1}
            </span>
            <span className="truncate max-w-[120px]">{loc.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
