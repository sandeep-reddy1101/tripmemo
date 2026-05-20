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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center max-w-md px-4">
        {/* Animated globe */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-blue-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center shadow-2xl">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Planning your trip</h2>
        <p className="text-blue-300 mb-2">
          {destinations.join(' → ')}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <step.icon className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-slate-300 text-sm font-medium">{step.text}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-slate-500 text-xs mt-2">This usually takes 10–30 seconds</p>
      </div>
    </div>
  )
}
