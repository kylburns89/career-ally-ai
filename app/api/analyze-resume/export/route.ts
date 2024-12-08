import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import type { ResumeAnalysis } from "@/types/database";

interface SectionAnalysis {
  score: number;
  impact: string;
  feedback: string[];
  suggestions: string[];
}

interface IndustryComparison {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

interface ATSCompatibility {
  score: number;
  keywords: {
    present: string[];
    missing: string[];
  };
  formatting: {
    issues: string[];
    suggestions: string[];
  };
}

export async function POST(request: Request) {
  try {
    const { analysis }: { analysis: ResumeAnalysis } = await request.json();

    if (!analysis) {
      return new NextResponse("Analysis data is required", { status: 400 });
    }

    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    generateAnalysisPDF(doc, analysis);

    // Get PDF as Uint8Array for better handling in serverless environment
    const pdfBuffer = doc.output('arraybuffer');
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-analysis.pdf"`,
        "Content-Length": pdfArray.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting analysis report:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function generateAnalysisPDF(doc: jsPDF, analysis: ResumeAnalysis) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const title = "Resume Analysis Report";
  const titleWidth = doc.getTextDimensions(title).w;
  doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  yPos += 20;

  // Overall Score
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Overall Score", margin, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`${analysis.score}/100`, margin, yPos);
  yPos += 20;

  // ATS Compatibility
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ATS Compatibility", margin, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Score: ${analysis.atsCompatibility.score}%`, margin, yPos);
  yPos += 10;

  // Keywords
  doc.setFont("helvetica", "bold");
  doc.text("Present Keywords:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const presentKeywords = analysis.atsCompatibility.keywords.present.join(", ");
  const presentLines = doc.splitTextToSize(presentKeywords, pageWidth - (2 * margin));
  doc.text(presentLines, margin, yPos);
  yPos += (presentLines.length * 6) + 6;

  doc.setFont("helvetica", "bold");
  doc.text("Missing Keywords:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const missingKeywords = analysis.atsCompatibility.keywords.missing.join(", ");
  const missingLines = doc.splitTextToSize(missingKeywords, pageWidth - (2 * margin));
  doc.text(missingLines, margin, yPos);
  yPos += (missingLines.length * 6) + 10;

  // Formatting Issues
  doc.setFont("helvetica", "bold");
  doc.text("Formatting Issues:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  analysis.atsCompatibility.formatting.issues.forEach((issue: string) => {
    const issueLines = doc.splitTextToSize(`• ${issue}`, pageWidth - (2 * margin));
    doc.text(issueLines, margin, yPos);
    yPos += (issueLines.length * 6);
  });
  yPos += 10;

  // Section Analysis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Section Analysis", margin, yPos);
  yPos += 10;

  Object.entries(analysis.sections).forEach(([section, data]: [string, SectionAnalysis]) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${section} (${data.score}/100)`, margin, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Impact: ${data.impact}`, margin, yPos);
    yPos += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Feedback:", margin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    data.feedback.forEach((item: string) => {
      const feedbackLines = doc.splitTextToSize(`• ${item}`, pageWidth - (2 * margin));
      doc.text(feedbackLines, margin, yPos);
      yPos += (feedbackLines.length * 6);
    });
    yPos += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Suggestions:", margin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    data.suggestions.forEach((item: string) => {
      const suggestionLines = doc.splitTextToSize(`• ${item}`, pageWidth - (2 * margin));
      doc.text(suggestionLines, margin, yPos);
      yPos += (suggestionLines.length * 6);
    });
    yPos += 10;
  });

  // Industry Comparison
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Industry Comparison", margin, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Score: ${analysis.industryComparison.score}%`, margin, yPos);
  yPos += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Strengths:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  analysis.industryComparison.strengths.forEach((strength: string) => {
    const strengthLines = doc.splitTextToSize(`• ${strength}`, pageWidth - (2 * margin));
    doc.text(strengthLines, margin, yPos);
    yPos += (strengthLines.length * 6);
  });
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Gaps:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  analysis.industryComparison.gaps.forEach((gap: string) => {
    const gapLines = doc.splitTextToSize(`• ${gap}`, pageWidth - (2 * margin));
    doc.text(gapLines, margin, yPos);
    yPos += (gapLines.length * 6);
  });
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Recommendations:", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  analysis.industryComparison.recommendations.forEach((rec: string) => {
    const recLines = doc.splitTextToSize(`• ${rec}`, pageWidth - (2 * margin));
    doc.text(recLines, margin, yPos);
    yPos += (recLines.length * 6);
  });
}
