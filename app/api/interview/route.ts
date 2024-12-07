import { CoreMessage } from 'ai'
import { createStreamingChatResponse } from '../../../lib/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    const defaultPrompt = 'You are an experienced interviewer conducting a job interview. Ask relevant technical and behavioral questions, provide feedback, and help the candidate improve their interview skills.'
    
    // Get the role from the system message
    const systemMessage = messages.find(m => m.role === 'system')
    const systemContent = typeof systemMessage?.content === 'string' ? systemMessage.content : ''
    
    const role = systemContent.includes('interviewer')
      ? systemContent
      : defaultPrompt

    const result = await createStreamingChatResponse(messages, role)
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Interview API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
