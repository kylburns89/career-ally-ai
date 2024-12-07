import OpenAI from 'openai'
import Together from "together-ai"
import { CoreMessage, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Standard OpenAI client for non-streaming operations
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Together.ai client for streaming chat operations
const togetherStream = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
  baseURL: "https://api.together.xyz/v1",
});

// Together.ai client for non-streaming operations
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
});

interface OpenAIOptions {
  model: string
  temperature: number
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

// Helper for non-streaming Together.ai chat completions
export async function createTogetherCompletion(
  messages: ChatMessage[],
  temperature: number = 0.7
) {
  const response = await together.chat.completions.create({
    model: "meta-llama/Llama-3-8b-chat-hf",
    messages,
    temperature,
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

// For non-streaming OpenAI chat completions
export async function createChatCompletion(
  messages: ChatMessage[],
  options: { model: string; temperature: number }
) {
  const response = await openai.chat.completions.create({
    messages: messages as any, // Type assertion needed due to OpenAI types being more specific
    model: options.model,
    temperature: options.temperature,
  })

  if (!response.choices?.length) {
    throw new Error('No choices returned from OpenAI')
  }

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content generated from OpenAI')
  }

  return content
}

export async function generateCareerPath(
  prompt: string,
  options: OpenAIOptions
): Promise<string> {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }] as any,
    model: options.model,
    temperature: options.temperature,
    response_format: options.response_format,
  })

  if (!response.choices?.length) {
    throw new Error('No choices returned from OpenAI')
  }

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content generated')
  }

  return content
}
