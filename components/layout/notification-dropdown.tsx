"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const initialNotifications = [
  {
    id: 1,
    type: "reminder" as const,
    title: "Daily Insight Available",
    description: "Your personalized cosmic guidance for today is ready",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    type: "reminder" as const,
    title: "Mercury Retrograde Alert",
    description: "Communication challenges may arise. Stay mindful.",
    time: "1 day ago",
    unread: true,
  },
  {
    id: 3,
    type: "payment" as const,
    title: "Payment Confirmed",
    description: "Your subscription has been successfully activated",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 4,
    type: "limit" as const,
    title: "15 Messages Remaining",
    description: "You're approaching your trial message limit",
    time: "3 days ago",
    unread: false,
  },
]

function getNotificationIcon(type: "reminder" | "payment" | "limit") {
  switch (type) {
    case "reminder":
      return <Bell className="w-4 h-4 text-primary" />
    case "payment":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case "limit":
      return <AlertTriangle className="w-4 h-4 text-amber-600" />
  }
}

export function NotificationDropdown({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })))
  }

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, unread: false } : notif)))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const hasUnread = notifications.some((n) => n.unread)

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 animate-in slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2"
        >
          <DropdownMenuLabel className="flex items-center justify-between py-3">
            <span>Notifications</span>
            {hasUnread && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-0 px-2 text-xs">
                Mark all as read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {"We'll notify you when something new arrives"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`flex flex-col items-start gap-1 p-4 cursor-pointer ${
                    notification.unread ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    {notification.unread && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
