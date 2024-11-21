import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OpenAIOptions {
  model: string;
  temperature: number;
  response_format?: {
    type: 'json_object';
  };
}

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: { model: string; temperature: number }
) {
  const response = await openai.chat.completions.create({
    messages: messages as any, // Type assertion needed due to OpenAI types being more specific
    model: options.model,
    temperature: options.temperature,
  });

  return response.choices[0].message.content;
}

export async function generateCareerPath(
  prompt: string,
  options: OpenAIOptions
): Promise<string> {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }] as any, // Type assertion needed due to OpenAI types being more specific
    model: options.model,
    temperature: options.temperature,
    response_format: options.response_format,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content generated');
  }

  return content;
}
