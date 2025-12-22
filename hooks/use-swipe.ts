"use client"

import { useRef, useEffect } from "react"

interface SwipeOptions {
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeRight, onSwipeLeft, threshold = 50 }: SwipeOptions) {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onSwipeRight, onSwipeLeft, threshold])
}
