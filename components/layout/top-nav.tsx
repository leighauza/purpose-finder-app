"use client"

import Link from "next/link"
import { Bell, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./notification-dropdown"
import { Badge } from "@/components/ui/badge"
import { haptic } from "@/lib/haptic"

export function TopNav() {
  const notificationCount = 3

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-11 h-11 bg-primary rounded-xl">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl hidden sm:inline">Vedic Guide</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationDropdown>
            <Button variant="ghost" size="icon" className="relative h-11 w-11" onClick={() => haptic.light()}>
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </NotificationDropdown>

          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => haptic.light()}>
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
