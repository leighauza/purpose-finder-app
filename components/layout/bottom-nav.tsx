"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptic"

const navItems = [
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-8 py-3 transition-colors min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => haptic.light()}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
