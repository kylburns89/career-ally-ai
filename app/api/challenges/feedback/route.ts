import { createStreamingChatResponse } from '../../../../lib/openai';
import { CoreMessage } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const systemContent = typeof systemMessage?.content === 'string' 
      ? systemMessage.content 
      : 'You are an experienced technical interviewer. Present coding challenges and problems, provide hints when needed, evaluate solutions, and offer constructive feedback.';

    const result = await createStreamingChatResponse(messages, systemContent);
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Technical challenge feedback error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
