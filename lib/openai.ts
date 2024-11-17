import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize OpenAI with Helicone proxy
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.hconeai.com/v1',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

// Wrapper function to handle rate limiting and user tracking
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string,
  userId?: string
) {
  try {
    // Add user ID to Helicone headers if available
    const options: OpenAI.RequestOptions = {
      headers: userId ? {
        'Helicone-User-Id': userId
      } : {}
    };

    const completion = await openai.chat.completions.create({
      messages,
      model,
    }, options);

    return completion;
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}

export default openai;
