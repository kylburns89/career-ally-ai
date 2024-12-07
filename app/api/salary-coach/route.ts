import { CoreMessage } from 'ai'
import { createStreamingChatResponse } from '../../../lib/openai'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    const defaultPrompt = 'You are an experienced salary negotiation coach. Help users understand their market value, provide negotiation strategies, and offer advice on compensation packages including salary, benefits, equity, and other perks. Use industry data and best practices to guide your responses.'
    
    // Get the system message content
    const systemMessage = messages.find(m => m.role === 'system')
    const systemContent = typeof systemMessage?.content === 'string' ? systemMessage.content : ''
    
    const prompt = systemContent || defaultPrompt

    const result = await createStreamingChatResponse(messages, prompt)
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Salary Coach API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
