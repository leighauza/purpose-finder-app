"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Smartphone, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { haptic } from "@/lib/haptic"

export function PaymentMethodCards() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLemonSqueezy = () => {
    haptic.medium()
    setIsRedirecting(true)
    // Replace with actual LemonSqueezy checkout URL
    window.location.href = "https://lemonsqueezy.com/checkout/your-product-id"
  }

  const handleGCash = () => {
    haptic.medium()
    router.push("/payment/gcash")
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* LemonSqueezy Card Payment */}
      <Card className="group p-6 bg-white border-2 border-sage/20 rounded-2xl hover:border-terracotta/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="space-y-6">
          {/* Label */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-xl text-terracotta">Card Payment</h3>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-2 bg-sage/10 rounded-lg text-xs font-medium text-sage">Visa</div>
            <div className="px-3 py-2 bg-sage/10 rounded-lg text-xs font-medium text-sage">Mastercard</div>
            <div className="px-3 py-2 bg-sage/10 rounded-lg text-xs font-medium text-sage">Amex</div>
            <div className="px-3 py-2 bg-sage/10 rounded-lg text-xs font-medium text-sage">PayPal</div>
            <div className="px-3 py-2 bg-sage/10 rounded-lg text-xs font-medium text-sage">Apple Pay</div>
          </div>

          {/* Price */}
          <div>
            <div className="text-4xl font-bold text-terracotta">$7.99</div>
            <div className="text-sage text-sm">/month</div>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">Instant activation</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">Auto-renewal</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">Secure checkout</span>
            </li>
          </ul>

          {/* Button */}
          <Button
            onClick={handleLemonSqueezy}
            disabled={isRedirecting}
            className="w-full min-h-[48px] text-base bg-terracotta hover:bg-terracotta/90 text-white font-semibold py-6 rounded-xl transition-all"
          >
            {isRedirecting ? "Redirecting..." : "Pay with Card"}
          </Button>
        </div>
      </Card>

      {/* GCash Manual Payment */}
      <Card className="group p-6 bg-white border-2 border-sage/20 rounded-2xl hover:border-terracotta/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="space-y-6">
          {/* Label */}
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-xl text-terracotta">GCash</h3>
          </div>

          {/* GCash Logo */}
          <div className="h-16 flex items-center justify-center bg-[#007DFF]/10 rounded-lg">
            <div className="text-3xl font-bold text-[#007DFF]">GCash</div>
          </div>

          {/* Price */}
          <div>
            <div className="text-4xl font-bold text-terracotta">₱299</div>
            <div className="text-sage text-sm">/month</div>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">Instant approval after verification</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">One-time monthly payment</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-sage leading-relaxed">No credit card needed</span>
            </li>
          </ul>

          {/* Button */}
          <Button
            onClick={handleGCash}
            className="w-full min-h-[48px] text-base bg-terracotta hover:bg-terracotta/90 text-white font-semibold py-6 rounded-xl transition-all"
          >
            Pay with GCash
          </Button>
        </div>
      </Card>
    </div>
  )
}
