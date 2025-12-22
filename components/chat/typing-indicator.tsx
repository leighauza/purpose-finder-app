export function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}
