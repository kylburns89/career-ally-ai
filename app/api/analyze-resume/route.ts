import { NextResponse } from "next/server";
import Together from "together-ai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { ResumeContent, ResumeAnalysis } from "../../../types/database";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY ?? "" });

function formatResumeForAnalysis(resume: ResumeContent): string {
  return `
PERSONAL INFORMATION:
Name: ${resume.personalInfo.fullName}
Email: ${resume.personalInfo.email}
Phone: ${resume.personalInfo.phone}
Location: ${resume.personalInfo.location}

WORK EXPERIENCE:
${resume.experience.map((exp: { title: string; company: string; duration: string; description: string }) => `
• ${exp.title} at ${exp.company}
  Duration: ${exp.duration}
  ${exp.description}
`).join('\n')}

EDUCATION:
${resume.education.map((edu: { degree: string; school: string; year: string }) => `
• ${edu.degree} from ${edu.school} (${edu.year})
`).join('\n')}

SKILLS:
${resume.skills.join(', ')}
`;
}

const systemPrompt = `You are an expert resume reviewer with years of experience in talent acquisition and career coaching. 
Your task is to analyze the resume and provide feedback in a specific JSON format.

IMPORTANT FORMATTING RULES:
1. Your response must be ONLY valid JSON - no other text before or after
2. All numbers must be numeric values (e.g., 85 not "85")
3. All text must be in double quotes
4. Use exactly this structure:

{
  "score": 85,
  "sections": {
    "experience": {
      "score": 80,
      "feedback": ["Strong experience section", "Good progression shown"],
      "suggestions": ["Add more quantifiable achievements", "Include technologies used"],
      "impact": "high"
    }
  },
  "atsCompatibility": {
    "score": 75,
    "issues": ["Missing key industry keywords", "Format could be improved"],
    "suggestions": ["Add more industry-specific terms", "Use standard section headings"],
    "keywords": {
      "present": ["leadership", "management", "development"],
      "missing": ["agile", "scrum", "stakeholder"]
    },
    "formatting": {
      "issues": ["Inconsistent spacing", "Complex formatting"],
      "suggestions": ["Simplify layout", "Use standard fonts"]
    }
  },
  "industryComparison": {
    "score": 70,
    "strengths": ["Technical expertise", "Project management"],
    "gaps": ["Leadership experience", "Industry certifications"],
    "recommendations": ["Pursue relevant certifications", "Highlight team leadership"]
  },
  "actionItems": {
    "high": ["Add metrics to achievements", "Include more keywords"],
    "medium": ["Improve formatting consistency", "Add certifications"],
    "low": ["Consider adding volunteer work", "Update skills section"]
  },
  "improvements": [
    {
      "section": "Experience - Software Engineer at Tech Corp",
      "original": "Developed features for the company's main product",
      "improved": "Led development of 3 key features for flagship product, increasing user engagement by 45% and reducing load times by 30%",
      "explanation": "The improved version adds specific metrics and leadership aspects, making the achievement more impactful and quantifiable"
    },
    {
      "section": "Skills Section",
      "original": "Programming, databases, web development",
      "improved": "Python, React, Node.js, PostgreSQL, AWS, CI/CD, Agile methodologies",
      "explanation": "Specific technologies and methodologies are more impactful than general categories, and these align better with ATS requirements"
    }
  ]
}

Remember: Your response must be ONLY the JSON object - no additional text or explanations.`;

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

    // Use Together.ai for completion
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-8b-chat-hf",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this resume and respond with ONLY a JSON object:\n\n${formattedResume}` }
      ],
      temperature: 0.3, // Lower temperature for more consistent formatting
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;

    // Ensure we have a valid response
    if (!content) {
      throw new Error("No response received from AI");
    }

    // Log the raw response for debugging
    console.log("Raw AI response:", content);

    // Try to clean the response if needed
    const cleanedContent = content.trim().replace(/```json\n?|\n?```/g, '');
    console.log("Cleaned content:", cleanedContent);

    // Parse the JSON response
    let analysisResult: ResumeAnalysis;
    try {
      analysisResult = JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.error("Response content:", cleanedContent);
      throw new Error("Failed to parse analysis results");
    }

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
      analysis: analysisResult,
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
