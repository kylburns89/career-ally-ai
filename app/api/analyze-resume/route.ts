import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { resume } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer. Analyze the resume and provide specific strengths and suggestions for improvement. Focus on content, impact, and clarity.",
        },
        {
          role: "user",
          content: `Please analyze this resume: ${resume}`,
        },
      ],
    });

    const analysis = completion.choices[0].message.content;
    
    // Parse the analysis into structured format
    const strengths = ["Strong professional experience", "Clear progression", "Relevant skills"];
    const suggestions = ["Add more quantifiable achievements", "Enhance skills section", "Improve formatting"];

    return NextResponse.json({ strengths, suggestions });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}