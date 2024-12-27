import type { ResumeContent, ResumeAnalysis } from '../../../types/resume';
import { createChatCompletion } from '../../../lib/openai';
import { createClient } from '@supabase/supabase-js';
import { Prisma } from '@prisma/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANALYSIS_PROMPT = `Analyze the following resume and provide detailed feedback in the following areas:
1. Overall quality and impact
2. ATS compatibility
3. Section-by-section analysis
4. Industry alignment
5. Specific improvements
6. Action items prioritized by importance

Resume Content:
`;

function isResumeContent(obj: unknown): obj is ResumeContent {
  if (!obj || typeof obj !== 'object') return false;
  const resume = obj as Partial<ResumeContent>;
  return (
    typeof resume.template === 'string' &&
    !!resume.personalInfo &&
    Array.isArray(resume.experience) &&
    Array.isArray(resume.education) &&
    Array.isArray(resume.skills)
  );
}

export async function POST(request: Request) {
  try {
    const { resume, resumeId } = await request.json();

    // Check cache first
    const { data: cachedAnalysis } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("resume_id", resumeId)
      .single();

    if (cachedAnalysis) {
      const cachedResumeContent = cachedAnalysis.resume_content;
      if (isResumeContent(cachedResumeContent) && !hasResumeChanged(resume, cachedResumeContent)) {
        return Response.json({ analysis: cachedAnalysis.analysis });
      }
    }

    // Perform analysis using Together.ai
    const analysis = await createChatCompletion(
      [
        {
          role: "system",
          content: "You are an expert resume analyzer with deep knowledge of ATS systems, industry standards, and hiring practices.",
        },
        {
          role: "user",
          content: `${ANALYSIS_PROMPT}${JSON.stringify(resume)}`,
        },
      ],
      { temperature: 0.7 }
    );

    // Parse and structure the analysis
    const structuredAnalysis = structureAnalysis(analysis);

    // Cache the results
    const resumeJson: Prisma.JsonValue = JSON.parse(JSON.stringify(resume));
    const analysisJson: Prisma.JsonValue = JSON.parse(JSON.stringify(structuredAnalysis));

    await supabase.from("resume_analyses").upsert({
      resume_id: resumeId,
      resume_content: resumeJson,
      analysis: analysisJson,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Return the analysis
    return Response.json({ analysis: structuredAnalysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    
    if (error instanceof Error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "An unexpected error occurred while analyzing the resume." },
      { status: 500 }
    );
  }
}

function hasResumeChanged(newResume: ResumeContent, cachedResume: ResumeContent): boolean {
  return JSON.stringify(newResume) !== JSON.stringify(cachedResume);
}

function structureAnalysis(rawAnalysis: string): ResumeAnalysis {
  try {
    // Extract scores and feedback from the raw analysis text
    // This is a simplified version - you would need more robust parsing
    const analysis: ResumeAnalysis = {
      score: extractOverallScore(rawAnalysis),
      atsCompatibility: extractAtsCompatibility(rawAnalysis),
      sections: extractSectionAnalysis(rawAnalysis),
      industryComparison: extractIndustryComparison(rawAnalysis),
      improvements: extractImprovements(rawAnalysis),
      actionItems: extractActionItems(rawAnalysis),
    };

    return analysis;
  } catch (error) {
    console.error("Error structuring analysis:", error);
    throw new Error("Failed to structure analysis results");
  }
}

function extractOverallScore(text: string): number {
  // Implementation would parse the overall score from the analysis text
  // This is a placeholder
  return 85;
}

function extractAtsCompatibility(text: string): ResumeAnalysis["atsCompatibility"] {
  // Implementation would parse ATS compatibility details
  // This is a placeholder
  return {
    score: 90,
    keywords: {
      present: ["JavaScript", "React", "TypeScript", "Node.js"],
      missing: ["Python", "AWS", "Docker"],
    },
    formatting: {
      issues: [
        "Some bullet points are too long",
        "Consider using more action verbs",
      ],
      suggestions: [
        "Break down long bullet points into multiple lines",
        "Start each bullet point with a strong action verb",
      ],
    },
  };
}

function extractSectionAnalysis(text: string): ResumeAnalysis["sections"] {
  // Implementation would parse section-by-section analysis
  // This is a placeholder
  return {
    experience: {
      score: 85,
      impact: "high",
      feedback: [
        "Good use of quantifiable achievements",
        "Clear progression shown",
      ],
      suggestions: [
        "Add more specific metrics",
        "Include technologies used in each role",
      ],
    },
    education: {
      score: 90,
      impact: "medium",
      feedback: [
        "Relevant degree clearly stated",
        "Academic achievements included",
      ],
      suggestions: [
        "Add any relevant coursework",
        "Include GPA if above 3.5",
      ],
    },
    skills: {
      score: 80,
      impact: "high",
      feedback: [
        "Good mix of technical and soft skills",
        "Clear organization",
      ],
      suggestions: [
        "Group skills by category",
        "Add proficiency levels",
      ],
    },
  };
}

function extractIndustryComparison(text: string): ResumeAnalysis["industryComparison"] {
  // Implementation would parse industry comparison details
  // This is a placeholder
  return {
    score: 85,
    strengths: [
      "Strong technical foundation",
      "Proven track record of delivery",
    ],
    gaps: [
      "Limited cloud platform experience",
      "No certifications listed",
    ],
    recommendations: [
      "Consider AWS certification",
      "Add more cloud-based projects",
    ],
  };
}

function extractImprovements(text: string): ResumeAnalysis["improvements"] {
  // Implementation would parse specific improvements
  // This is a placeholder
  return [
    {
      section: "Experience",
      original: "Worked on various projects using React",
      improved: "Led development of 3 critical React applications, improving user engagement by 40%",
      explanation: "Adding specific metrics and leadership aspects strengthens the impact",
    },
    {
      section: "Skills",
      original: "JavaScript, React, Node.js",
      improved: "Frontend: React, JavaScript (ES6+), TypeScript\nBackend: Node.js, Express, PostgreSQL",
      explanation: "Organizing skills by category and showing depth of knowledge",
    },
  ];
}

function extractActionItems(text: string): ResumeAnalysis["actionItems"] {
  // Implementation would parse and prioritize action items
  // This is a placeholder
  return {
    high: [
      "Add metrics to experience bullet points",
      "Obtain cloud certification",
    ],
    medium: [
      "Reorganize skills section",
      "Add relevant coursework",
    ],
    low: [
      "Consider adding volunteer work",
      "Update portfolio link",
    ],
  };
}
