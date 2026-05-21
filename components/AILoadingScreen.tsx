'use client'

import { useEffect, useState } from 'react'
import { MapPin, Sparkles, Map, Clock, DollarSign } from 'lucide-react'

const steps = [
  { icon: Map, text: 'Mapping your destinations...' },
  { icon: Sparkles, text: 'Crafting your itinerary...' },
  { icon: Clock, text: 'Scheduling perfect timing...' },
  { icon: DollarSign, text: 'Estimating budgets...' },
  { icon: MapPin, text: 'Adding local tips...' },
]

interface AILoadingScreenProps {
  destinations: string[]
}

export default function AILoadingScreen({ destinations }: AILoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95))
    }, 300)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Warm ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-stone-950 to-stone-950 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-md px-4">
        {/* Animated globe */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-amber-500/15 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-amber-500/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-900/50">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Planning your trip</h2>
        <p className="text-amber-300/80 mb-2 font-medium">
          {destinations.join(' → ')}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 my-6 min-h-[2rem]">
          <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
            <step.icon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-stone-300 text-sm font-medium">{step.text}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-stone-600 text-xs mt-3">This usually takes 10–30 seconds</p>
      </div>
    </div>
  )
}
