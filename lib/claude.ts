import Anthropic from '@anthropic-ai/sdk'
import { Itinerary, PlanTripInput, BrochureData } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const ITINERARY_SCHEMA = `{
  "trip_title": "string",
  "summary": "string",
  "days": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "color": "#hexcolor",
      "locations": [
        {
          "name": "string",
          "type": "string",
          "time": "string",
          "duration": "string",
          "description": "string",
          "tickets_required": boolean,
          "ticket_url": "string or null",
          "cost_estimate": "string",
          "maps_query": "string",
          "tips": "string",
          "category": "nature|food|culture|adventure|shopping|other"
        }
      ],
      "stay": {
        "name": "string",
        "address": "string",
        "booking_url": "string",
        "cost_estimate": "string"
      },
      "meals": [
        {
          "type": "breakfast|lunch|dinner",
          "suggestion": "string",
          "maps_query": "string"
        }
      ]
    }
  ],
  "packing_tips": ["string"],
  "budget_estimate": {
    "low": number,
    "high": number,
    "currency": "USD"
  }
}`

export async function generateItinerary(input: PlanTripInput): Promise<Itinerary> {
  const dayCount = calculateDayCount(input.start_date, input.end_date)
  const destinationsStr = input.destinations.join(', ')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
    system: `You are an expert travel planner with deep local knowledge. Given the user's destinations, dates, preferences, and budget, create a detailed day-by-day itinerary.

CRITICAL: Respond ONLY with valid JSON matching this exact schema:
${ITINERARY_SCHEMA}

Rules:
- Be specific with real place names and real locations
- Include practical tips from local knowledge
- Flag any attractions that require advance ticket booking
- Assign each day a unique color hex that matches its theme (nature=greens, city=blues, culture=purples, beach=teals, adventure=oranges)
- Estimate realistic costs in USD
- Include 2-4 locations per day plus meals
- Make meal suggestions specific and well-known establishments
- Do not include any text outside the JSON object
- Ensure the JSON is valid and complete`,
    messages: [
      {
        role: 'user',
        content: `Plan a ${dayCount}-day trip to ${destinationsStr}.
Dates: ${input.start_date} to ${input.end_date}
Travelers: ${input.travelers} people
Preferences: ${input.preferences}
${input.budget ? `Budget: ${input.budget}` : ''}

Generate a complete day-by-day itinerary as JSON.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  const jsonText = content.text.trim()
  const parsed = JSON.parse(jsonText) as Itinerary
  return parsed
}

export async function generateBrochureNarrative(
  tripTitle: string,
  destinations: string[],
  itinerary: Itinerary
): Promise<BrochureData> {
  const dayThemes = itinerary.days.map((d) => `Day ${d.day}: ${d.theme}`).join(', ')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: `You are writing a warm, personal travel memoir entry for a trip journal/brochure.
Given the trip details, write:
1. A 2-3 sentence trip summary (evocative, personal tone)
2. A 1-2 sentence highlight for each day

Keep it warm, vivid, and personal — like a friend describing their incredible trip.
Respond ONLY with valid JSON: { "summary": "...", "day_highlights": ["...", "..."] }`,
    messages: [
      {
        role: 'user',
        content: `Trip: ${tripTitle}
Destinations: ${destinations.join(', ')}
Days: ${dayThemes}
Trip Summary: ${itinerary.summary}

Write a personal, evocative narrative for this trip brochure.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return JSON.parse(content.text.trim()) as BrochureData
}

function calculateDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diff)
}
