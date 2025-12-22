import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessAnimationProps {
  message?: string
  show: boolean
  onComplete?: () => void
  className?: string
}

export function SuccessAnimation({ message = "Success!", show, onComplete, className }: SuccessAnimationProps) {
  if (!show) return null

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}
      onAnimationEnd={onComplete}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="rounded-full bg-primary/10 p-6 animate-bounce-in">
          <CheckCircle2 className="size-16 text-primary" />
        </div>
        <p className="text-xl font-serif text-foreground">{message}</p>
      </div>
    </div>
  )
}
