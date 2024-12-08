'use client'

import { useChat } from 'ai/react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { KeyboardEvent, ChangeEvent } from 'react'

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
  const { messages, input, setInput, append } = useChat({
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
    ]
  })

  return (
    <Card className={`min-h-[600px] flex flex-col ${className}`}>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          message.role !== 'system' && (
            <div key={index} className="flex gap-2">
              <span className="font-medium min-w-[50px]">
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
                      <a className="text-blue-500 hover:underline" {...props} />
                    ),
                    code: ({node, ...props}) => (
                      <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-1" {...props} />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          )
        ))}
      </div>

      <div className="border-t p-4">
        <Input
          value={input}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={async (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' && input.trim()) {
              append({ content: input, role: 'user' })
              setInput('')
            }
          }}
          placeholder="Type a message and press Enter..."
          className="w-full"
        />
      </div>
    </Card>
  )
}
