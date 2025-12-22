"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What happens after my free trial ends?",
    answer:
      "After 20 messages, you'll see a gentle prompt to subscribe. Your chat history and birth chart data are saved, so you can pick up right where you left off once you upgrade to Premium.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "You have complete freedom to cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "How accurate are the readings?",
    answer:
      "Our AI is trained on traditional Vedic astrology principles and thousands of chart interpretations. While astrology is an interpretive practice, we strive for depth, nuance, and personalization in every reading.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We currently accept GCash for Philippine users and credit/debit cards for international users. All payments are processed securely through our payment partners.",
  },
  {
    question: "Is my birth information kept private?",
    answer:
      "Yes, absolutely. Your birth details and all conversations are encrypted and stored securely. We never share your personal information with third parties.",
  },
]

export function SubscriptionFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 text-foreground">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 pt-0">
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
