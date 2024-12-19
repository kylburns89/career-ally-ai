import Together from "together-ai"
import { CoreMessage, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

if (!process.env.TOGETHER_API_KEY) {
  throw new Error('Missing TOGETHER_API_KEY environment variable');
}

// Together.ai client for streaming chat operations
const togetherStream = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
  baseURL: "https://api.together.xyz/v1",
});

// Together.ai client for non-streaming operations
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
});

// Default model for Together.ai
const DEFAULT_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";

interface TogetherOptions {
  model?: string
  temperature?: number
  response_format?: {
    type: 'json_object'
  }
}

type ChatRole = 'system' | 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
}

// Helper for streaming chat responses
export async function createStreamingChatResponse(
  messages: CoreMessage[],
  systemPrompt: string = 'You are a helpful assistant.'
) {
  return streamText({
    model: togetherStream('meta-llama/Llama-3.3-70B-Instruct-Turbo'),
    system: systemPrompt,
    messages,
  })
}

// Helper for chat completions (replaces both createTogetherCompletion and createChatCompletion)
export async function createChatCompletion(
  messages: ChatMessage[],
  options: TogetherOptions = {}
) {
  const response = await together.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: 4000,
  });

  if (!response.choices?.length) {
    throw new Error('No choices returned from Together.ai')
  }

  const content = response.choices[0].message?.content
  if (!content) {
    throw new Error('No content generated from Together.ai')
  }

  return content;
}

export async function generateCareerPath(
  prompt: string,
  options: TogetherOptions = {}
): Promise<string> {
  return createChatCompletion(
    [{ role: 'user', content: prompt }],
    {
      model: options.model || DEFAULT_MODEL,
      temperature: options.temperature || 0.7,
    }
  );
}
