import { PaymentMethodCards } from "@/components/payment/payment-method-cards"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentSelectPage() {
  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/subscription/manage"
          className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-terracotta mb-3">Choose Payment Method</h1>
          <p className="text-sage text-lg">Select how you'd like to subscribe</p>
        </div>

        {/* Payment Cards */}
        <PaymentMethodCards />

        {/* Bottom Section */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sage text-sm flex items-center justify-center gap-2">
            <span className="text-base">🔒</span>
            Secure payment • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
