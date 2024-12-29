import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/auth-options";
import { prisma } from "../../../../../../lib/prisma";
import { ResumeContent, AvailableTemplate, normalizeTemplate } from "../../../../../../types/resume";

const PAGE = {
  WIDTH: 8.5,
  HEIGHT: 11,
  MARGIN: {
    TOP: 1,
    BOTTOM: 1,
    LEFT: 0.75,
    RIGHT: 0.75
  }
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface TemplateStyles {
  headerSize: number;
  sectionHeaderSize: number;
  textSize: number;
  headerColor: readonly [number, number, number];
  accentColor: readonly [number, number, number];
  font: "helvetica" | "courier" | "times";
  spacing: number;
}

const templateStyles: Record<AvailableTemplate, TemplateStyles> = {
  professional: {
    headerSize: 24,
    sectionHeaderSize: 14,
    textSize: 11,
    headerColor: [0, 0, 0],
    accentColor: [0, 102, 255],
    font: "helvetica",
    spacing: 0.2
  },
  minimal: {
    headerSize: 22,
    sectionHeaderSize: 13,
    textSize: 10,
    headerColor: [96, 96, 96],
    accentColor: [128, 128, 128],
    font: "helvetica",
    spacing: 0.18
  },
  technical: {
    headerSize: 22,
    sectionHeaderSize: 14,
    textSize: 10,
    headerColor: [0, 128, 0],
    accentColor: [0, 150, 136],
    font: "courier",
    spacing: 0.15
  }
};

// Helper function to check if we need a page break
function checkPageBreak(doc: jsPDF, currentY: number, minSpace: number = 1): number {
  if (currentY > (PAGE.HEIGHT - PAGE.MARGIN.BOTTOM - minSpace)) {
    doc.addPage();
    return PAGE.MARGIN.TOP;
  }
  return currentY;
}

// Helper function to safely handle text content
function sanitizeText(text: unknown): string {
  if (typeof text !== 'string') {
    console.warn('Invalid text content:', text);
    return '';
  }
  return text
    .replace(/[^\x20-\x7E\n]/g, '')
    .trim();
}

// Helper function to format description into bullet points
function formatDescription(description: string): string[] {
  return description
    .split(/[\n\r]+\s*|\s*[•\-*]\s+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[•\-*]\s*/, '').trim());
}

// Helper function to add text with line breaks and bullet points
function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, addBullet: boolean = false, styles: TemplateStyles): number {
  const sanitizedText = sanitizeText(text);
  if (!sanitizedText) return y;

  let lines: string[];
  if (addBullet) {
    lines = formatDescription(sanitizedText);
  } else {
    lines = sanitizedText.split(/\n/).filter(Boolean);
  }
  
  let currentY = y;
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const textToWrite = addBullet ? `• ${line}` : line;
    const wrappedLines = doc.splitTextToSize(textToWrite, maxWidth);
    
    for (let i = 0; i < wrappedLines.length; i++) {
      currentY = checkPageBreak(doc, currentY);
      
      if (addBullet && i > 0) {
        doc.text(wrappedLines[i], x + 0.25, currentY);
      } else {
        doc.text(wrappedLines[i], x, currentY);
      }
      
      currentY += styles.spacing;
    }
    
    if (addBullet) {
      currentY += styles.spacing * 0.5;
    }
  }

  return currentY;
}

// Helper function to format technologies
function formatTechnologies(technologies: string | string[]): string {
  if (Array.isArray(technologies)) {
    return technologies.filter(Boolean).join(", ");
  }
  return sanitizeText(technologies);
}

// Helper function to add a section header
function addSectionHeader(doc: jsPDF, text: string, y: number, styles: TemplateStyles): number {
  y = checkPageBreak(doc, y);
  doc.setFontSize(styles.sectionHeaderSize);
  doc.setFont(styles.font, "bold");
  doc.setTextColor(styles.headerColor[0], styles.headerColor[1], styles.headerColor[2]);
  doc.text(text, PAGE.MARGIN.LEFT, y);
  
  const textWidth = doc.getTextWidth(text);
  doc.setLineWidth(0.02);
  doc.setDrawColor(styles.accentColor[0], styles.accentColor[1], styles.accentColor[2]);
  doc.line(PAGE.MARGIN.LEFT, y + 0.1, PAGE.MARGIN.LEFT + textWidth, y + 0.1);
  
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  return y + styles.spacing + 0.1;
}

// Helper function to add a clickable link with underline
function addLink(doc: jsPDF, text: string, x: number, y: number, styles: TemplateStyles, align: 'left' | 'right' | 'center' = 'left'): void {
  const sanitizedText = sanitizeText(text);
  if (!sanitizedText) return;

  const textWidth = doc.getTextWidth(sanitizedText);
  const maxWidth = PAGE.WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT;
  
  if (textWidth > maxWidth) {
    const scaleFactor = maxWidth / textWidth;
    doc.setFontSize(styles.textSize * scaleFactor);
  }
  
  let startX = x;
  if (align === 'right') {
    startX = PAGE.WIDTH - PAGE.MARGIN.RIGHT - textWidth;
  } else if (align === 'center') {
    startX = (PAGE.WIDTH - textWidth) / 2;
  }
  
  doc.setTextColor(styles.accentColor[0], styles.accentColor[1], styles.accentColor[2]);
  doc.text(sanitizedText, startX, y);
  
  doc.setLineWidth(0.02);
  doc.setDrawColor(styles.accentColor[0], styles.accentColor[1], styles.accentColor[2]);
  doc.line(startX, y + 0.02, startX + textWidth, y + 0.02);
  
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setFontSize(styles.textSize);
}

// Helper function to set up the document with proper font encoding
function setupDocument(template: AvailableTemplate = 'professional'): jsPDF {
  const doc = new jsPDF({
    unit: "in",
    format: "letter",
    putOnlyUsedFonts: true,
    compress: true,
    hotfixes: ["px_scaling"]
  });

  const style = templateStyles[template];
  
  doc.setFont(style.font);
  doc.setFontSize(style.textSize);
  doc.setProperties({
    title: "Resume",
    creator: "Career Ally AI"
  });
  
  return doc;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ format: string; id: string }> }
) {
  // Currently only PDF format is supported
  const { format, id } = await params;
  
  if (format.toLowerCase() !== 'pdf') {
    return new NextResponse(
      JSON.stringify({
        error: "Unsupported format",
        message: "Currently only PDF format is supported",
        requestedFormat: format
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  let retries = 0;

  async function attemptExport(): Promise<Response> {
    try {
      console.log("Starting PDF export for resume:", id);
      
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return new NextResponse(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fetch resume data
      const resume = await prisma.resume.findUnique({
        where: {
          id: id,
          userId: session.user.id,
        },
      });

      if (!resume) {
        return new NextResponse(
          JSON.stringify({ error: "Resume not found" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate resume content
      const content = resume.content as unknown as ResumeContent;
      if (!content?.personalInfo || !content?.experience || !content?.education || !content?.skills) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid resume content" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generate PDF
      console.log("Generating PDF with template:", content.template);
      const template = normalizeTemplate(content.template);
      const styles = templateStyles[template];
      const doc = setupDocument(template);

      let currentY = PAGE.MARGIN.TOP;

      // Header section
      doc.setFontSize(styles.headerSize);
      doc.setFont(styles.font, "bold");
      doc.setTextColor(styles.headerColor[0], styles.headerColor[1], styles.headerColor[2]);
      const name = sanitizeText(content.personalInfo.fullName || content.personalInfo.name || "");
      doc.text(name, PAGE.WIDTH / 2, currentY, { align: "center" });
      currentY += styles.spacing * 2;

      // Contact info
      doc.setFontSize(styles.textSize);
      doc.setFont(styles.font, "normal");
      doc.setTextColor(0, 0, 0);
      const contactInfo = [
        content.personalInfo.email,
        content.personalInfo.phone,
        content.personalInfo.location,
      ].filter(Boolean).map(sanitizeText);
      doc.text(contactInfo.join(" | "), PAGE.WIDTH / 2, currentY, { align: "center" });
      currentY += styles.spacing;

      // Links
      if (content.personalInfo.linkedin || content.personalInfo.website) {
        const links = [
          content.personalInfo.linkedin,
          content.personalInfo.website
        ].filter(Boolean).map(sanitizeText);
        addLink(doc, links.join(" | "), PAGE.WIDTH / 2, currentY, styles, 'center');
        currentY += styles.spacing * 2;
      }

      currentY += styles.spacing;

      // Summary section
      if (content.summary) {
        currentY = addSectionHeader(doc, "Summary", currentY, styles);
        doc.setFontSize(styles.textSize);
        doc.setFont(styles.font, "normal");
        currentY = addWrappedText(
          doc,
          content.summary,
          PAGE.MARGIN.LEFT,
          currentY,
          PAGE.WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT,
          false,
          styles
        );
        currentY += styles.spacing;
      }

      // Experience section
      if (content.experience?.length > 0) {
        currentY = addSectionHeader(doc, "Experience", currentY, styles);

        doc.setFontSize(styles.textSize);
        for (const exp of content.experience) {
          currentY = checkPageBreak(doc, currentY);
          
          doc.setFont(styles.font, "bold");
          doc.text(sanitizeText(exp.title), PAGE.MARGIN.LEFT, currentY);
          doc.setFont(styles.font, "normal");
          doc.text(sanitizeText(exp.duration), PAGE.WIDTH - PAGE.MARGIN.RIGHT, currentY, { align: "right" });
          currentY += styles.spacing;
          doc.text(sanitizeText(exp.company), PAGE.MARGIN.LEFT, currentY);
          currentY += styles.spacing;
          
          currentY = addWrappedText(
            doc, 
            exp.description,
            PAGE.MARGIN.LEFT + 0.15,
            currentY,
            PAGE.WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT - 0.15,
            true,
            styles
          );
          currentY += styles.spacing;
        }
      }

      // Projects section
      if (Array.isArray(content.projects) && content.projects.length > 0) {
        currentY = addSectionHeader(doc, "Projects", currentY, styles);

        doc.setFontSize(styles.textSize);
        for (const project of content.projects) {
          currentY = checkPageBreak(doc, currentY);
          
          doc.setFont(styles.font, "bold");
          doc.text(sanitizeText(project.name), PAGE.MARGIN.LEFT, currentY);
          currentY += styles.spacing;

          doc.setFont(styles.font, "normal");
          const technologies = formatTechnologies(project.technologies);
          doc.text(technologies, PAGE.MARGIN.LEFT, currentY);

          if (project.url || project.link) {
            addLink(doc, sanitizeText(project.url || project.link || ""), PAGE.WIDTH - PAGE.MARGIN.RIGHT, currentY, styles, 'right');
          }
          currentY += styles.spacing;

          currentY = addWrappedText(
            doc,
            project.description,
            PAGE.MARGIN.LEFT + 0.15,
            currentY,
            PAGE.WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT - 0.15,
            true,
            styles
          );
          currentY += styles.spacing;
        }
      }

      // Education section
      if (content.education?.length > 0) {
        currentY = addSectionHeader(doc, "Education", currentY, styles);

        doc.setFontSize(styles.textSize);
        for (const edu of content.education) {
          currentY = checkPageBreak(doc, currentY);
          
          doc.setFont(styles.font, "bold");
          doc.text(sanitizeText(edu.degree), PAGE.MARGIN.LEFT, currentY);
          doc.text(sanitizeText(edu.year || edu.graduationDate || ""), PAGE.WIDTH - PAGE.MARGIN.RIGHT, currentY, { align: "right" });
          currentY += styles.spacing;
          doc.setFont(styles.font, "normal");
          doc.text(sanitizeText(edu.school), PAGE.MARGIN.LEFT, currentY);
          currentY += styles.spacing;
        }
      }

      // Skills section
      if (content.skills?.length > 0) {
        currentY = addSectionHeader(doc, "Skills", currentY, styles);

        doc.setFontSize(styles.textSize);
        doc.setFont(styles.font, "normal");
        const skillsText = content.skills.map(sanitizeText).filter(Boolean).join(" • ");
        currentY = addWrappedText(
          doc,
          skillsText,
          PAGE.MARGIN.LEFT,
          currentY,
          PAGE.WIDTH - PAGE.MARGIN.LEFT - PAGE.MARGIN.RIGHT,
          false,
          styles
        );
      }

      // Generate PDF buffer
      console.log("Generating PDF buffer");
      const pdfBuffer = doc.output("arraybuffer");

      console.log("Returning PDF response");
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${resume.title}-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      if (retries < MAX_RETRIES) {
        console.log(`Retrying (${retries + 1}/${MAX_RETRIES})...`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptExport();
      }
      
      return new NextResponse(
        JSON.stringify({
          error: "Error generating PDF",
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return attemptExport();
}
