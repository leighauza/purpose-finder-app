"use client"

export function ChatEmptyState({ onPromptClick }: { onPromptClick?: (prompt: string) => void }) {
  const examplePrompts = [
    "What does my chart say about my career?",
    "Tell me about my life purpose",
    "What are my biggest strengths?",
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-12 text-center">
      {/* Friendly icon */}
      <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
        Hi! I'm Clarity, your personal Astrology reader
      </h2>

      {/* Subtext */}
      <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
        This is a safe space to explore your path. Ask me anything about your chart, career, relationships, or life
        purpose. I'm here to listen and guide.
      </p>

      {/* Example prompts */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <p className="text-sm text-muted-foreground mb-1">Try asking:</p>
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick?.(prompt)}
            className="text-left px-4 py-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-[0.98] transition-all text-sm text-foreground border border-border/50 min-h-[48px] flex items-center"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
