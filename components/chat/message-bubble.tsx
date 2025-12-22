import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const timeString = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

  if (isToday) {
    return timeString
  } else if (isYesterday) {
    return `Yesterday ${timeString}`
  } else {
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${timeString}`
  }
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in-up">
        <div className="max-w-md text-center">
          <p className="text-sm italic text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col animate-fade-in-up", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      <p className={cn("text-xs mt-1 px-2 text-muted-foreground")}>{formatTimestamp(message.timestamp)}</p>
    </div>
  )
}