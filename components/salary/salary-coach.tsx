'use client';

import { useChat } from 'ai/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SalaryCoach() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: '/api/salary-coach',
    initialMessages: [
      {
        id: 'init',
        role: 'assistant',
        content: 'Hi! I\'m your AI Salary Coach. I can help you understand salary ranges, negotiate better compensation, and make informed career decisions. What would you like to know about salaries or compensation?'
      }
    ]
  });

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.role === 'assistant'
                  ? 'items-start'
                  : 'items-end'
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-[85%] ${
                  message.role === 'assistant'
                    ? 'bg-secondary'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm">
              An error occurred. Please try again.
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about salaries, compensation, or negotiation..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
}
