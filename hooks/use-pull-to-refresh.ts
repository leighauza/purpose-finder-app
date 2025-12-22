"use client"

import { useRef, useEffect, useState } from "react"

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0 && touchStartY.current > 0) {
        const touchY = e.touches[0].clientY
        const distance = touchY - touchStartY.current

        if (distance > 0) {
          setPullDistance(Math.min(distance, threshold * 1.5))
          setIsPulling(true)
        }
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold) {
        await onRefresh()
      }
      setPullDistance(0)
      setIsPulling(false)
      touchStartY.current = 0
    }

    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchmove", handleTouchMove)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [pullDistance, threshold, onRefresh])

  return { containerRef, isPulling, pullDistance }
}
