export type TripStatus = 'planning' | 'active' | 'completed'
export type MemberRole = 'owner' | 'collaborator'

export interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface ItineraryLocation {
  name: string
  type: string
  time: string
  duration: string
  description: string
  tickets_required: boolean
  ticket_url: string | null
  cost_estimate: string
  maps_query: string
  tips: string
  category: 'nature' | 'food' | 'culture' | 'adventure' | 'shopping' | 'other'
}

export interface ItineraryMeal {
  type: 'breakfast' | 'lunch' | 'dinner'
  suggestion: string
  maps_query: string
}

export interface ItineraryStay {
  name: string
  address: string
  booking_url: string
  cost_estimate: string
}

export interface ItineraryDay {
  day: number
  date: string
  theme: string
  color: string
  locations: ItineraryLocation[]
  stay: ItineraryStay
  meals: ItineraryMeal[]
}

export interface BudgetEstimate {
  low: number
  high: number
  currency: string
}

export interface Itinerary {
  trip_title: string
  summary: string
  days: ItineraryDay[]
  packing_tips: string[]
  budget_estimate: BudgetEstimate
}

export interface Trip {
  id: string
  title: string
  description: string | null
  destinations: string[]
  start_date: string | null
  end_date: string | null
  status: TripStatus
  itinerary: Itinerary | null
  cover_image_url: string | null
  created_by: string
  created_at: string
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  user?: User
}

export interface TripPhoto {
  id: string
  trip_id: string
  uploaded_by: string
  storage_path: string
  caption: string | null
  day_number: number | null
  uploaded_at: string
  uploader?: User
  public_url?: string
}

export interface TripInvite {
  id: string
  trip_id: string
  invited_email: string
  invite_token: string
  accepted: boolean
  created_at: string
}

export interface TripWithMembers extends Trip {
  members: TripMember[]
}

export interface BrochureData {
  summary: string
  day_highlights: string[]
}

export interface PlanTripInput {
  destinations: string[]
  start_date: string
  end_date: string
  travelers: number
  preferences: string
  budget?: string
}
