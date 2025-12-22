"use client"

import { useEffect, useState } from "react"

interface GreetingOverlayProps {
  userName: string
}

export function GreetingOverlay({ userName }: GreetingOverlayProps) {
  const [timeOfDay, setTimeOfDay] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setTimeOfDay("morning")
    } else if (hour < 18) {
      setTimeOfDay("afternoon")
    } else {
      setTimeOfDay("evening")
    }
  }, [])

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Frosted glass backdrop with gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-md" />

        {/* Greeting content */}
        <div className="relative text-center px-4 animate-in fade-in duration-700">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3 text-balance">
            Good {timeOfDay}, {userName}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">What would you like to explore today?</p>
        </div>
      </div>
    </div>
  )
}
