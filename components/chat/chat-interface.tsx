"use client"

import { useState, useRef, useEffect } from "react"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { TypingIndicator } from "./typing-indicator"
import { ChatEmptyState } from "./chat-empty-state"
import { GreetingOverlay } from "./greeting-overlay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSwipe } from "@/hooks/use-swipe"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { haptic } from "@/lib/haptic"
import { Loader2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLeft, setMessagesLeft] = useState<number | null>(20)
  const [isTyping, setIsTyping] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Fetch subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/subscription/check')
        if (res.ok) {
          const data = await res.json()
          if (data.subscription?.status === 'trial') {
            const remaining = data.subscription.trial_messages_remaining - data.subscription.total_messages_sent
            setMessagesLeft(Math.max(0, remaining))
          } else {
            setMessagesLeft(null) // Premium
          }
        }
      } catch (err) {
        console.error('Subscription check failed:', err)
      }
    }
    checkSubscription()
  }, [])

  useSwipe({
    onSwipeRight: () => {
      haptic.medium()
      router.back()
    },
  })

  const { containerRef, isPulling, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      haptic.medium()
      await new Promise((resolve) => setTimeout(resolve, 800))
    },
    threshold: 80,
  })

  useEffect(() => {
    if (containerRef.current && messagesContainerRef.current) {
      containerRef.current = messagesContainerRef.current
    }
  }, [containerRef])

  useEffect(() => {
    if (messages.length > 0) {
      setShowGreeting(true)
    }
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const atBottom = scrollHeight - scrollTop - clientHeight < 50
      setIsAtBottom(atBottom)

      if (scrollTop > 100) {
        setShowGreeting(false)
      } else if (atBottom && messages.length > 0) {
        setShowGreeting(true)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const isLimitReached = messagesLeft !== null && messagesLeft <= 0

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isLimitReached) return

    haptic.light()
    setShowGreeting(false)
    setError(null)

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)

        if (res.status === 403 && data?.limit_reached) {
          setMessagesLeft(0)
          haptic.medium()
          setError("You've reached your 20 free messages. Please subscribe to continue.")
          setIsTyping(false)
          setIsLoading(false)
          return
        }

        if (res.status === 401) {
          setError("Session expired. Please log in again.")
          haptic.error()
          setIsTyping(false)
          setIsLoading(false)
          router.push("/login")
          return
        }

        setError(data?.error || "Something went wrong. Please try again.")
        haptic.error()
        setIsTyping(false)
        setIsLoading(false)
        return
      }

      const data: {
        success: boolean
        message: string
        limit_reached: boolean
        messages_remaining: number | null
      } = await res.json()

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setMessagesLeft(
        data.messages_remaining !== null ? Math.max(0, data.messages_remaining) : null
      )

      if (data.limit_reached) {
        haptic.medium()
      } else {
        haptic.success()
      }
    } catch (err) {
      setError("Chat failed. Please check your connection and try again.")
      haptic.error()
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleInputFocus = () => {
    setShowGreeting(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {messagesLeft === null ? "Premium" : "Free Trial"}
          </span>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {messagesLeft === null ? "Unlimited messages" : `${messagesLeft} messages left`}
          </Badge>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 relative">
        {isPulling && (
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-20"
            style={{
              height: `${pullDistance}px`,
              opacity: Math.min(pullDistance / 80, 1),
            }}
          >
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {(isLimitReached || error) && (
          <div className="absolute top-3 left-0 right-0 z-20 flex justify-center px-4">
            <div className="max-w-md w-full bg-card rounded-2xl p-3 shadow border border-border text-sm text-center">
              {error && <p className="text-destructive mb-1">{error}</p>}
            </div>
          </div>
        )}

        {isLimitReached && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-lg border border-border text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">
                You&apos;ve explored your first 20 insights!
              </h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to continue your journey.
              </p>
              <Button
                onClick={() => {
                  haptic.medium()
                  router.push("/subscription-prompt")
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px]"
              >
                View Subscription Plans
              </Button>
            </div>
          </div>
        )}

        {messages.length > 0 && showGreeting && <GreetingOverlay userName="Friend" />}

        <div
          className={`container max-w-4xl mx-auto space-y-6 transition-opacity duration-500 ${
            showGreeting ? "opacity-30" : "opacity-100"
          }`}
        >
          {messages.length === 0 ? (
            <ChatEmptyState onPromptClick={handleSendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-4">
        <div className="container max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLimitReached || isLoading}
            onFocus={handleInputFocus}
          />
        </div>
      </div>
    </div>
  )
}