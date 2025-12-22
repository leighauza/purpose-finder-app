"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Determine direction based on route change
    // You can customize this logic based on your routing structure
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={cn(
        "min-h-screen",
        isAnimating && direction === "right" && "animate-slide-in-right",
        isAnimating && direction === "left" && "animate-slide-in-left",
      )}
    >
      {children}
    </div>
  )
}
