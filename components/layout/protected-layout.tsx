"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { TopNav } from "./top-nav"
import { BottomNav } from "./bottom-nav"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show navigation on onboarding and subscription-prompt
  const showNav = pathname !== "/onboarding" && pathname !== "/subscription-prompt"

  return (
    <div className="min-h-screen flex flex-col">
      {showNav && <TopNav />}
      <main className={`flex-1 ${showNav ? "pb-16 md:pb-0" : ""}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
