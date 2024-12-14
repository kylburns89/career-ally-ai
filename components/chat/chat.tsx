'use client'

import { useChat } from 'ai/react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { KeyboardEvent, ChangeEvent, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ChatProps {
  apiEndpoint?: string
  systemPrompt?: string
  initialMessage?: string
  className?: string
}

export default function Chat({ 
  apiEndpoint = '/api/chat',
  systemPrompt = 'You are a helpful career assistant.',
  initialMessage = 'Hi! How can I help you today?',
  className = ''
}: ChatProps) {
  const [isWaitingLong, setIsWaitingLong] = useState(false)
  const { messages, input, setInput, append, isLoading, error } = useChat({
    api: apiEndpoint,
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: systemPrompt
      },
      {
        id: 'welcome',
        role: 'assistant',
        content: initialMessage
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    }
  })

  // Set up a timer for long responses
  const handleMessageSend = async (content: string) => {
    if (!content.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      // Start a timer to check if the response is taking too long
      const timer = setTimeout(() => {
        setIsWaitingLong(true)
        toast.info('This is taking longer than usual. Please wait...')
      }, 10000) // Show message after 10 seconds

      await append({ content, role: 'user' })
      
      // Clear the timer and reset the waiting state
      clearTimeout(timer)
      setIsWaitingLong(false)
      
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <Card className={`min-h-[600px] flex flex-col ${className}`}>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          message.role !== 'system' && (
            <div key={index} className="flex gap-2">
              <span className="font-medium min-w-[50px] text-foreground">
                {message.role === 'user' ? 'You:' : 'AI:'}
              </span>
              <div className="flex-1 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: ({node, ...props}) => (
                      <ul className="list-disc list-outside ml-4 my-2" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="my-1" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-primary hover:text-primary/90 hover:underline" {...props} />
                    ),
                    code: ({node, ...props}) => (
                      <code className="bg-muted text-muted-foreground rounded px-1" {...props} />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          )
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        {error && (
          <div className="text-destructive text-sm">
            Error: {error.message}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Input
          value={input}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={async (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (isLoading) {
                toast.error('Please wait for the current response')
                return
              }
              handleMessageSend(input)
            }
          }}
          placeholder="Type a message and press Enter..."
          className="w-full"
          disabled={isLoading}
        />
      </div>
    </Card>
  )
}
