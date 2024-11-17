"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

type Message = {
  role: "assistant" | "user"
  content: string
}

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Mobile Developer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Software Engineer",
  "Other",
] as const

export default function InterviewSimulator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [customRole, setCustomRole] = useState("")

  const startInterview = async () => {
    setIsInterviewStarted(true)
    setIsLoading(true)
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: "start",
          role: selectedRole === "Other" ? customRole : selectedRole 
        }),
      })
      
      const data = await response.json()
      setMessages([{ role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Failed to start interview:", error)
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
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: userMessage,
          role: selectedRole === "Other" ? customRole : selectedRole 
        }),
      })
      
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Failed to get response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const endInterview = () => {
    setIsInterviewStarted(false)
    setMessages([])
    setSelectedRole("")
    setCustomRole("")
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
    if (value !== "Other") {
      setCustomRole("")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6">
        {!isInterviewStarted ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Practice?</h2>
            <p className="mb-6 text-muted-foreground">
              Select a role and start a mock interview with our AI interviewer. You&apos;ll receive questions
              and feedback to help you improve your interviewing skills.
            </p>
            <div className="max-w-xs mx-auto mb-6 space-y-4">
              <Select
                value={selectedRole}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole === "Other" && (
                <Input
                  type="text"
                  placeholder="Enter your desired role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <Button 
              onClick={startInterview} 
              disabled={isLoading || !selectedRole || (selectedRole === "Other" && !customRole.trim())}
            >
              {isLoading ? "Starting..." : "Start Interview"}
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
                      {message.content}
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
                className="min-h-[100px]"
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={endInterview}>
                  End Interview
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
