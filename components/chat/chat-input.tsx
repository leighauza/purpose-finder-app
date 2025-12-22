"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { haptic } from "@/lib/haptic"

type ChatInputProps = {
  onSendMessage: (message: string) => void
  disabled?: boolean
  onFocus?: () => void
}

export function ChatInput({ onSendMessage, disabled = false, onFocus }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "50px"
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 50 + 24 * 3
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px"
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      haptic.light()
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (e.target.value.length > 0 && onFocus) {
      onFocus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Upgrade to continue chatting..." : "Ask about your stars..."}
        disabled={disabled}
        className="min-h-[50px] resize-none bg-background text-base"
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || disabled}
        className="h-[50px] w-[50px] flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}
