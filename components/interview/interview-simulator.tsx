'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Chat from '@/components/chat/chat'

export default function InterviewSimulator() {
  const [selectedRole, setSelectedRole] = useState('Software Engineer')
  const [customRole, setCustomRole] = useState('')

  const currentRole = selectedRole === 'Other' ? customRole : selectedRole

  const systemPrompt = `You are an experienced interviewer conducting a job interview for the role of ${currentRole}. Ask relevant technical and behavioral questions, provide feedback, and help the candidate improve their interview skills.`

  const initialMessage = `Hello! I'll be conducting your interview for the ${currentRole} position today. We'll cover both technical and behavioral questions. Are you ready to begin?`

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interview Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="UX Designer">UX Designer</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {selectedRole === 'Other' && (
              <Input
                placeholder="Enter role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="flex-1"
              />
            )}
          </div>

          <Chat 
            apiEndpoint="/api/interview"
            systemPrompt={systemPrompt}
            initialMessage={initialMessage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
