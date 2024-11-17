"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

type Message = {
  role: "assistant" | "user"
  content: string
}

export default function TechnicalChallengeSimulator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSessionStarted, setIsSessionStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startSession = async () => {
    setIsSessionStarted(true)
    setIsLoading(true)
    try {
      const response = await fetch("/api/challenges/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      })
      
      const data = await response.json()
      setMessages([{ role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Failed to start session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/challenges/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })
      
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Failed to get response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const endSession = () => {
    setIsSessionStarted(false)
    setMessages([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6">
        {!isSessionStarted ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Practice?</h2>
            <Button onClick={startSession} disabled={isLoading}>
              {isLoading ? "Starting..." : "Start Practice Session"}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-secondary"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg px-4 py-2">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                className="min-h-[100px] font-mono"
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={endSession}>
                  End Session
                </Button>
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  Send Response
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Card>
  )
}
