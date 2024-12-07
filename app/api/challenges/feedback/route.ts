import { CoreMessage } from 'ai'
import { createStreamingChatResponse } from '../../../../lib/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    const defaultPrompt = 'You are an experienced technical interviewer. Present coding challenges and problems, provide hints when needed, evaluate solutions, and offer constructive feedback to help improve problem-solving skills.'
    
    // Get the topic from the system message
    const systemMessage = messages.find(m => m.role === 'system')
    const systemContent = typeof systemMessage?.content === 'string' ? systemMessage.content : ''
    
    const topic = systemContent.includes('technical interviewer')
      ? systemContent
      : defaultPrompt

    const result = await createStreamingChatResponse(messages, topic)
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Technical Challenge API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
