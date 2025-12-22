"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, Sparkles } from "lucide-react"
import { haptic } from "@/lib/haptic"

type PlanType = "trial" | "premium"

export function SubscriptionManagement() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<PlanType>("trial")
  const [currency, setCurrency] = useState<"PHP" | "USD">("PHP")
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)

  // Mock data - replace with actual user data
  const messagesUsed = 18
  const messagesTotal = 20
  const renewalDate = "Jan 15, 2025"
  const progressPercentage = (messagesUsed / messagesTotal) * 100

  const plans = [
    {
      id: "trial" as PlanType,
      name: "Free Trial",
      description: "Perfect for exploring your cosmic path",
      features: ["20 messages included", "Basic birth chart analysis", "Daily cosmic guidance"],
    },
    {
      id: "premium" as PlanType,
      name: "Premium",
      price: currency === "PHP" ? "₱299" : "$7.99",
      period: "/month",
      description: "Unlimited wisdom from the cosmos",
      features: [
        "Unlimited messages",
        "Detailed birth chart analysis",
        "Personalized daily insights",
        "Priority support",
      ],
    },
  ]

  const handleUpgrade = () => {
    haptic.medium()
    router.push("/payment/select")
  }

  const handleDowngrade = () => {
    haptic.medium()
    setShowDowngradeDialog(true)
  }

  const confirmDowngrade = () => {
    haptic.success()
    setCurrentPlan("trial")
    setShowDowngradeDialog(false)
    // Add actual downgrade logic here
  }

  return (
    <div className="space-y-8">
      {/* Status Section */}
      <Card className="border-border bg-background shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan === "trial" ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Messages Used</span>
                  <span className="text-sm font-medium">
                    {messagesUsed} of {messagesTotal}
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  indicatorClassName={`${
                    progressPercentage > 80 ? "bg-destructive" : progressPercentage > 60 ? "bg-accent" : "bg-secondary"
                  }`}
                  className="h-3"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upgrade to Premium for unlimited messages and more features.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-xl border border-secondary/30">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Premium Active</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews on <strong>{renewalDate}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payment method: {currency === "PHP" ? "GCash" : "Card"} •••• 1234
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You have unlimited access to all premium features. Your subscription will automatically renew on{" "}
                {renewalDate}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => {
              haptic.light()
              setCurrency("PHP")
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              currency === "PHP" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PHP
          </button>
          <button
            onClick={() => {
              haptic.light()
              setCurrency("USD")
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              currency === "USD" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          const isPremiumCard = plan.id === "premium"

          return (
            <Card
              key={plan.id}
              className={`border-2 transition-all relative rounded-2xl shadow-lg ${
                isCurrentPlan ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    Current Plan
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                {isPremiumCard && (
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  isPremiumCard ? (
                    <Button
                      onClick={handleDowngrade}
                      variant="outline"
                      className="w-full min-h-[48px] text-base border-border hover:bg-muted bg-transparent rounded-xl"
                    >
                      Downgrade to Free Trial
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full min-h-[48px] text-base bg-muted text-muted-foreground cursor-not-allowed rounded-xl"
                    >
                      Current Plan
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    className="w-full min-h-[48px] text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-xl"
                  >
                    {isPremiumCard ? "Upgrade to Premium" : "Switch to Free Trial"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Downgrade Confirmation Dialog */}
      <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <AlertDialogContent className="border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Downgrade to Free Trial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to downgrade to the Free Trial? Your Premium access will continue until{" "}
              <strong>{renewalDate}</strong>, after which you'll be limited to 20 messages per month.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border hover:bg-muted min-h-[44px] rounded-xl"
              onClick={() => haptic.light()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDowngrade}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] rounded-xl"
            >
              Yes, Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
