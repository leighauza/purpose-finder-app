import { Check, X } from "lucide-react"

const features = [
  { name: "Messages per month", trial: "20 messages", premium: "Unlimited" },
  { name: "Birth chart analysis", trial: true, premium: true },
  { name: "Daily cosmic guidance", trial: true, premium: true },
  { name: "Personalized insights", trial: false, premium: true },
  { name: "Advanced predictions", trial: false, premium: true },
  { name: "Priority support", trial: false, premium: true },
  { name: "Transit notifications", trial: false, premium: true },
  { name: "Compatibility readings", trial: false, premium: true },
]

export function ComparisonTable() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 text-foreground">Compare Plans</h2>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-foreground">Features</th>
                <th className="text-center p-4 font-medium text-foreground w-32 md:w-40">Free Trial</th>
                <th className="text-center p-4 font-medium text-primary w-32 md:w-40">Premium</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-4 text-foreground">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.trial === "boolean" ? (
                      feature.trial ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">{feature.trial}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.premium === "boolean" ? (
                      feature.premium ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-foreground font-medium">{feature.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
