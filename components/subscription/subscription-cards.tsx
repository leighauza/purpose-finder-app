"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import { haptic } from "@/lib/haptic"

const plans = {
  PHP: [
    {
      id: "trial",
      name: "Free Trial",
      price: "Free",
      description: "Start your journey with 20 messages",
      features: [
        "20 messages included",
        "Basic birth chart analysis",
        "Daily cosmic guidance",
        "No credit card required",
      ],
      buttonText: "Start Free Trial",
      variant: "outline" as const,
    },
    {
      id: "premium",
      name: "Premium",
      price: "₱299",
      period: "/month",
      description: "Unlimited wisdom from the cosmos",
      features: [
        "Unlimited messages",
        "Detailed birth chart analysis",
        "Personalized daily insights",
        "Priority support",
        "Advanced predictions",
      ],
      buttonText: "Go Premium",
      variant: "default" as const,
      highlighted: true,
    },
  ],
  USD: [
    {
      id: "trial",
      name: "Free Trial",
      price: "Free",
      description: "Start your journey with 20 messages",
      features: [
        "20 messages included",
        "Basic birth chart analysis",
        "Daily cosmic guidance",
        "No credit card required",
      ],
      buttonText: "Start Free Trial",
      variant: "outline" as const,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$6.99",
      period: "/month",
      description: "Unlimited wisdom from the cosmos",
      features: [
        "Unlimited messages",
        "Detailed birth chart analysis",
        "Personalized daily insights",
        "Priority support",
        "Advanced predictions",
      ],
      buttonText: "Go Premium",
      variant: "default" as const,
      highlighted: true,
    },
  ],
}

export function SubscriptionCards() {
  const router = useRouter()
  const [currency, setCurrency] = useState<"PHP" | "USD">("PHP")
  const currentPlans = plans[currency]

  const handleSelectPlan = (planId: string) => {
    haptic.medium()
    if (planId === "trial") {
      router.push("/chat")
    } else {
      router.push("/payment/gcash")
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => {
              haptic.light()
              setCurrency("PHP")
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              currency === "PHP"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
              currency === "USD"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border shadow-lg relative transition-all ${
              plan.highlighted ? "ring-2 ring-primary shadow-[0_0_30px_rgba(224,123,83,0.15)]" : ""
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                variant={plan.variant}
                className={`w-full min-h-[48px] text-base ${
                  plan.variant === "default"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
