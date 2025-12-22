import { SubscriptionCards } from "@/components/subscription/subscription-cards"
import { ComparisonTable } from "@/components/subscription/comparison-table"
import { SubscriptionFAQ } from "@/components/subscription/subscription-faq"
import { Sparkles, Star } from "lucide-react"

export default function SubscriptionPromptPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">Choose Your Path</h1>
          <p className="text-muted-foreground text-lg mb-6">Begin your journey with ancient wisdom</p>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-full">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-sm text-foreground">{"Trusted by 10,000+ seekers worldwide"}</span>
          </div>
        </div>

        <SubscriptionCards />

        <div className="mt-16">
          <ComparisonTable />
        </div>

        <div className="mt-16">
          <SubscriptionFAQ />
        </div>
      </div>
    </div>
  )
}
