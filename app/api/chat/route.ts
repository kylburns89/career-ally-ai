import { CoreMessage } from 'ai'
import { createStreamingChatResponse } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    const result = await createStreamingChatResponse(
      messages,
      'You are a helpful career assistant.'
    )

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
