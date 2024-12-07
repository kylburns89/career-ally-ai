'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Chat from '@/components/chat/chat'

export default function SalaryCoach() {
  const systemPrompt = `You are an experienced salary negotiation coach. Help users understand their market value, provide negotiation strategies, and offer advice on compensation packages including salary, benefits, equity, and other perks. Use industry data and best practices to guide your responses.`

  const initialMessage = `Welcome! I'm here to help you with salary negotiation and compensation discussions. To get started, you can:

* Share details about a job offer you'd like to negotiate
* Ask about market rates for your role and experience
* Get advice on benefits and equity packages
* Learn negotiation strategies and best practices

What would you like to discuss?`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Salary Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <Chat 
            apiEndpoint="/api/salary-coach"
            systemPrompt={systemPrompt}
            initialMessage={initialMessage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
