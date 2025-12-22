"use client"

import { SubscriptionManagement } from "@/components/subscription/subscription-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { haptic } from "@/lib/haptic"

export default function ManageSubscriptionPage() {
  const router = useRouter()

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => {
          haptic.light()
          router.push("/settings")
        }}
        className="mb-6 -ml-2 text-sage hover:text-terracotta hover:bg-terracotta/10 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-foreground mb-2">Manage Subscription</h1>
        <p className="text-muted-foreground">View and manage your subscription plan</p>
      </div>

      <SubscriptionManagement />
    </div>
  )
}
