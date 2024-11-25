import Together from 'together-ai';
import { createTogetherAI } from '@ai-sdk/togetherai';

// Create a Together AI provider instance with our API key for the Vercel AI SDK
export const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY ?? '',
});

// Export the default model we use most often
export const defaultModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';

// Helper function to create a Together AI model instance with our default model
export function getTogetherModel(modelId: string = defaultModel) {
  return togetherai(modelId);
}

// Legacy client for backward compatibility
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

interface TogetherOptions {
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
  const response = await together.chat.completions.create({
    messages: messages,
    model: options.model || defaultModel,
    temperature: options.temperature,
  });

  if (!response.choices[0]?.message?.content) {
    throw new Error('No content generated');
  }

  return response.choices[0].message.content;
}

export async function createStreamingChatCompletion(
  messages: ChatMessage[],
  options: { model: string; temperature: number }
) {
  return together.chat.completions.create({
    messages: messages,
    model: options.model || defaultModel,
    temperature: options.temperature,
    stream: true,
  });
}

export async function generateCareerPath(
  prompt: string,
  options: TogetherOptions
): Promise<string> {
  const response = await together.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: options.model || defaultModel,
    temperature: options.temperature,
    response_format: options.response_format,
  });

  if (!response.choices[0]?.message?.content) {
    throw new Error('No content generated');
  }

  return response.choices[0].message.content;
}
