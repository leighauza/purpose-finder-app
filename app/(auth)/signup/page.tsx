import { SignupForm } from "@/components/auth/signup-form"
import { Sparkles } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Begin Your Journey</h1>
          <p className="text-muted-foreground">Discover ancient wisdom guided by the cosmos</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
