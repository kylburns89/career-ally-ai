import { togetherai } from '@ai-sdk/togetherai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
      system: `You are an expert AI Salary Coach with deep knowledge of compensation, salary ranges, negotiation strategies, and career development. Your goal is to help users understand their market value, negotiate better compensation packages, and make informed career decisions.

Key responsibilities:
- Provide accurate salary information and ranges based on industry standards
- Share effective negotiation strategies and tips
- Help users understand total compensation packages (base salary, bonuses, equity, benefits)
- Guide users in career planning and advancement for better compensation
- Explain industry-specific compensation trends and practices

Always be professional, supportive, and data-driven in your responses. When discussing specific numbers, clarify that they are estimates and encourage users to validate with multiple sources.`,
      messages,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        if (error == null) {
          return 'An unknown error occurred. Please try again.';
        }

        if (typeof error === 'string') {
          return error;
        }

        if (error instanceof Error) {
          return error.message;
        }

        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error('Salary Coach Error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request.',
      }),
      { status: 500 }
    );
  }
}
