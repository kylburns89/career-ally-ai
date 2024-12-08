import jsPDF from "jspdf";
import type { ResumeContent, ResumeAnalysis } from "@/types/resume";

export async function POST(request: Request) {
  try {
    const { resume, resumeId } = await request.json();

    // Mock analysis result for demonstration
    const analysis: ResumeAnalysis = {
      score: 85,
      atsCompatibility: {
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
      },
      sections: {
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
      },
      industryComparison: {
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
      },
      improvements: [
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
      ],
      actionItems: {
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
      },
    };

    return Response.json({ analysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return Response.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
