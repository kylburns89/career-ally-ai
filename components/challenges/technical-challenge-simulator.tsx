'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Chat from '@/components/chat/chat'

export default function TechnicalChallengeSimulator() {
  const [selectedTopic, setSelectedTopic] = useState('Algorithms')
  const [customTopic, setCustomTopic] = useState('')

  const currentTopic = selectedTopic === 'Other' ? customTopic : selectedTopic
  const systemPrompt = `You are an experienced technical interviewer. Present coding challenges and problems related to ${currentTopic}. Provide hints when needed, evaluate solutions, and offer constructive feedback to help improve problem-solving skills.`

  const initialMessage = `Welcome to your ${currentTopic} practice session! I'll present you with technical challenges and provide feedback on your solutions. Would you like to start with an easy, medium, or hard problem?`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Technical Challenge Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Algorithms">Algorithms</SelectItem>
                <SelectItem value="Data Structures">Data Structures</SelectItem>
                <SelectItem value="System Design">System Design</SelectItem>
                <SelectItem value="Database">Database</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {selectedTopic === 'Other' && (
              <Input
                type="text"
                placeholder="Enter custom topic"
                value={customTopic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTopic(e.target.value)}
                className="w-[200px]"
              />
            )}
          </div>

          <Chat 
            apiEndpoint="/api/challenges/feedback"
            systemPrompt={systemPrompt}
            initialMessage={initialMessage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
