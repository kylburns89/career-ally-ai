import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { ResumeContent, ResumeAnalysis } from "@/types/database";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatResumeForAnalysis(resume: ResumeContent): string {
  return `
PERSONAL INFORMATION:
Name: ${resume.personalInfo.fullName}
Email: ${resume.personalInfo.email}
Phone: ${resume.personalInfo.phone}
Location: ${resume.personalInfo.location}

WORK EXPERIENCE:
${resume.experience.map(exp => `
• ${exp.title} at ${exp.company}
  Duration: ${exp.duration}
  ${exp.description}
`).join('\n')}

EDUCATION:
${resume.education.map(edu => `
• ${edu.degree} from ${edu.school} (${edu.year})
`).join('\n')}

SKILLS:
${resume.skills.join(', ')}
`;
}

export async function POST(req: Request) {
  try {
    const { resume, resumeId } = await req.json();

    if (!resumeId) {
      throw new Error("Resume ID is required");
    }

    // Validate resume structure
    if (!resume || !resume.personalInfo || !resume.experience || !resume.education || !resume.skills) {
      throw new Error("Invalid resume structure");
    }

    const formattedResume = formatResumeForAnalysis(resume as ResumeContent);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert resume reviewer with years of experience in talent acquisition and career coaching. 
          Analyze the resume and provide detailed feedback in the following format:

          STRENGTHS:
          - [Strength 1]
          - [Strength 2]
          ...

          SUGGESTIONS:
          - [Suggestion 1]
          - [Suggestion 2]
          ...

          Focus on:
          1. Content quality and relevance
          2. Impact and achievement metrics
          3. Skills alignment with industry standards
          4. Professional presentation and clarity
          5. Keywords and ATS optimization`,
        },
        {
          role: "user",
          content: `Please analyze this resume:\n\n${formattedResume}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0].message.content;
    
    if (!analysis) {
      throw new Error("No analysis received from OpenAI");
    }

    // Parse the analysis into structured format
    const strengthsMatch = analysis.match(/STRENGTHS:\n((?:- [^\n]+\n?)+)/);
    const suggestionsMatch = analysis.match(/SUGGESTIONS:\n((?:- [^\n]+\n?)+)/);

    const strengths = strengthsMatch ? 
      strengthsMatch[1]
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', '').trim())
      : [];

    const suggestions = suggestionsMatch ? 
      suggestionsMatch[1]
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', '').trim())
      : [];

    if (strengths.length === 0 && suggestions.length === 0) {
      throw new Error("Failed to parse analysis results");
    }

    // Create the analysis object
    const analysisResult: ResumeAnalysis = {
      strengths,
      suggestions,
      generated_at: new Date().toISOString()
    };

    // Store the analysis in the database
    const supabase = createRouteHandlerClient({ cookies });

    // First, check if the resume belongs to the authenticated user
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resumeData) {
      throw new Error("Resume not found or access denied");
    }

    // Get the current user's ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error("Authentication required");
    }

    // Verify ownership
    if (resumeData.user_id !== session.user.id) {
      throw new Error("Access denied");
    }

    // Update the resume with the new analysis
    const { data: updatedResume, error: updateError } = await supabase
      .from('resumes')
      .update({ 
        analysis: analysisResult,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to save analysis: ${updateError.message}`);
    }

    return NextResponse.json({ 
      ...updatedResume,
      success: true 
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze resume",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false
      },
      { status: 500 }
    );
  }
}
