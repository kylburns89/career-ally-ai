import { NextResponse } from "next/server";
import { createChatCompletion } from "../../../lib/openai";

const systemPrompt = `You are an expert cover letter writer with years of experience in professional writing and recruitment. 
Your task is to create compelling, personalized cover letters that effectively showcase the candidate's relevant experience and skills for the specific job they're applying to.

Guidelines for cover letter generation:
- Keep the tone professional yet engaging
- Highlight specific experiences and skills that match the job requirements
- Show enthusiasm for the role and company
- Maintain a clear structure: opening, body paragraphs, closing
- Keep the length appropriate (around 300-400 words)
- Avoid clichés and generic statements
- Include specific examples where possible
- Ensure proper formatting with paragraphs
- Match the style to the selected template (professional, creative, or technical)`;

// Helper function to estimate tokens (rough estimate)
function estimateTokenCount(text: string): number {
  // LLaMA models typically use ~4 characters per token
  return Math.ceil(text.length / 4);
}

export async function POST(req: Request) {
  try {
    const { 
      jobTitle, 
      companyName, 
      jobDescription, 
      resumeContent, 
      industry,
      template 
    } = await req.json();

    // Validate required fields
    if (!jobDescription || !resumeContent) {
      return NextResponse.json(
        { error: "Job description and resume content are required" },
        { status: 400 }
      );
    }

    // Estimate total tokens for input
    const totalTokens = estimateTokenCount(
      systemPrompt + 
      (jobTitle || "") + 
      (companyName || "") + 
      jobDescription + 
      resumeContent +
      (industry || "") +
      (template || "")
    );

    // Check token limit
    if (totalTokens > 7500) {
      return NextResponse.json(
        { 
          error: "Content exceeds maximum length. Please reduce the length of your inputs.",
          type: "token_limit"
        },
        { status: 413 }
      );
    }

    const prompt = `Write a ${template || "professional"} style cover letter for a ${jobTitle || "position"} at ${companyName || "the company"}.

Job Description:
${jobDescription}

Candidate's Resume:
${resumeContent}

${industry ? `Industry Context: ${industry}` : ""}

Focus on matching the candidate's most relevant experiences with the job requirements while maintaining a ${template || "professional"} tone.`;

    const coverLetter = await createChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      { temperature: 0.7 }
    );

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error("Cover Letter Generation Error:", error);
    
    // Handle rate limiting
    if (error?.response?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Handle token limit
    if (error?.response?.status === 413) {
      return NextResponse.json(
        { 
          error: "Content too long. Please reduce the length of your inputs.",
          type: "token_limit"
        },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
