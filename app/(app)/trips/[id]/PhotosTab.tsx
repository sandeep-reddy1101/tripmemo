'use client'

import { useState, useRef } from 'react'
import { TripPhoto } from '@/lib/types'
import { Upload, X, Camera, Loader2, Trash2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface PhotosTabProps {
  tripId: string
  photos: TripPhoto[]
  currentUserId: string
  days: number
  onDelete: (photoId: string) => void
  onUpload: (photo: TripPhoto) => void
}

export default function PhotosTab({ tripId, photos, currentUserId, days, onDelete, onUpload }: PhotosTabProps) {
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [dayTag, setDayTag] = useState('')
  const [lightbox, setLightbox] = useState<TripPhoto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tripId', tripId)
      formData.append('caption', caption)
      if (dayTag) formData.append('dayNumber', dayTag)

      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      onUpload({ ...data.photo, public_url: data.public_url })
      setCaption('')
      setDayTag('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingId(photoId)
    try {
      const res = await fetch('/api/delete-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })
      if (!res.ok) throw new Error('Delete failed')
      if (lightbox?.id === photoId) setLightbox(null)
      onDelete(photoId)
    } catch {
      setError('Failed to delete photo')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Upload section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-500" />
          Add a photo
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
          />
          {days > 0 && (
            <select
              value={dayTag}
              onChange={(e) => setDayTag(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
            >
              <option value="">Tag a day</option>
              {Array.from({ length: days }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Day {i + 1}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-200 rounded-xl p-4 cursor-pointer transition-colors">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-blue-600 font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600 font-medium">Choose a photo to upload</span>
              <span className="text-blue-400 text-sm ml-auto hidden sm:block">
                JPG, PNG, WebP
              </span>
            </>
          )}
        </label>
      </div>

      {/* Photos grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No photos yet</h3>
          <p className="text-slate-500 text-sm">
            Upload photos from your trip — they appear live for everyone!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-200"
              onClick={() => setLightbox(photo)}
            >
              <img
                src={photo.public_url}
                alt={photo.caption ?? 'Trip photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

              {/* Delete button — only for uploader */}
              {photo.uploaded_by === currentUserId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo.id) }}
                  disabled={deletingId === photo.id}
                  className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  {deletingId === photo.id
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5 text-white" />}
                </button>
              )}

              {/* Uploader avatar */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold border border-white">
                  {getInitials(photo.uploader?.full_name ?? 'U')}
                </div>
              </div>

              {photo.day_number && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                  Day {photo.day_number}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox.public_url}
            alt={lightbox.caption ?? 'Trip photo'}
            className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
              {lightbox.caption}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
