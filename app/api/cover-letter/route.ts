import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- Ensure proper formatting with paragraphs`;

// Helper function to estimate tokens (rough estimate)
function estimateTokenCount(text: string): number {
  // GPT models typically use ~4 characters per token
  return Math.ceil(text.length / 4);
}

export async function POST(req: Request) {
  try {
    const { jobTitle, companyName, jobDescription, keySkills, resumeUrl } = await req.json();

    // Fetch the resume content
    const resumeResponse = await fetch(resumeUrl);
    if (!resumeResponse.ok) {
      throw new Error("Failed to fetch resume");
    }
    const resumeContent = await resumeResponse.text();

    // Estimate total tokens for input
    const totalTokens = estimateTokenCount(
      systemPrompt + 
      jobTitle + 
      companyName + 
      jobDescription + 
      keySkills + 
      resumeContent
    );

    // GPT-4-turbo has a 128k context window, but we'll keep a safe limit
    if (totalTokens > 100000) { // Safe limit to allow for response tokens
      return NextResponse.json(
        { 
          error: "Content exceeds maximum length. Please reduce the length of your inputs.",
          type: "token_limit"
        },
        { status: 413 }
      );
    }

    const prompt = `Write a cover letter for a ${jobTitle} position at ${companyName}.

Job Description:
${jobDescription}

Required Skills:
${keySkills}

Candidate's Resume:
${resumeContent}

Focus on matching the candidate's most relevant experiences with the job requirements while maintaining a professional tone.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 16000, // GPT-4-turbo max output tokens
    });

    const coverLetter = completion.choices[0]?.message?.content || 
      "Error: Unable to generate cover letter. Please try again.";

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error("Cover Letter Generation Error:", error);
    
    // Handle different types of errors
    if (error?.response?.status === 429) {
      return NextResponse.json(
        { 
          error: "Request too large. While we support larger content with GPT-4-turbo, this request still exceeds our limits. Please try reducing your inputs.",
          type: "token_limit"
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
