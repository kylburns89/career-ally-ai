import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an expert salary negotiation coach with years of experience helping professionals negotiate better compensation packages. 
Your role is to provide practical, actionable advice for salary negotiations.

Focus on:
- Concrete negotiation tactics and strategies
- Market research and salary data interpretation
- Communication techniques for difficult conversations
- Tips for timing salary discussions
- Handling common negotiation scenarios
- Benefits and perks negotiation

Keep responses concise, practical, and actionable. Use examples where helpful.`;

export async function POST(req: Request) {
  try {
    const { message, messages } = await req.json();

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Salary Coach API Error:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
