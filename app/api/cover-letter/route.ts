import { NextResponse } from "next/server";
import { createChatCompletion } from "../../../lib/openai";

const systemPrompt = `You are an expert cover letter writer with years of experience in professional writing and recruitment. 
Your task is to create compelling, personalized cover letters that effectively showcase the candidate's relevant experience and skills for the specific job they're applying to.

STRUCTURE AND FORMATTING:
1. Opening Paragraph (2-3 sentences)
   - Start with a strong hook that grabs attention
   - State the specific position and company name
   - Briefly mention how you learned about the role (if provided)

2. Body Paragraphs (2-3 paragraphs)
   - Each paragraph should focus on 1-2 key requirements from the job description
   - Use the STAR method (Situation, Task, Action, Result) for examples
   - Connect past achievements directly to the new role's requirements

3. Closing Paragraph (2-3 sentences)
   - Restate enthusiasm for the role and company
   - Include a clear call to action
   - Thank the reader for their time

STYLE GUIDELINES:
- Professional Template: Focus on achievements and metrics, formal tone
- Creative Template: Showcase innovation and unique approaches, conversational yet professional
- Technical Template: Emphasize technical skills and projects, include specific technologies

CUSTOMIZATION RULES:
1. Job Description Analysis
   - Identify 3-4 key requirements/skills
   - Mirror important keywords and industry terminology
   - Address specific technical requirements when present

2. Resume Integration
   - Reference most relevant experiences from the resume
   - Expand on (don't just repeat) resume achievements
   - Focus on experiences that best match the job requirements

3. Company Research Integration
   - Reference company values or mission when possible
   - Show understanding of company's industry position
   - Connect your experience to company's needs

DO'S:
- Use active voice and strong action verbs
- Include specific metrics and achievements
- Demonstrate knowledge of the company/industry
- Keep length between 300-400 words
- Use natural paragraph breaks for readability

DON'TS:
- Avoid generic phrases like "I believe" or "I feel"
- Don't repeat resume content verbatim
- Avoid overly formal or outdated language
- Never use generic templates without customization
- Don't include irrelevant experiences

TONE AND LANGUAGE:
- Maintain professional enthusiasm
- Be confident but not arrogant
- Use industry-appropriate terminology
- Adjust formality based on company culture
- Keep sentences clear and concise`;

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
