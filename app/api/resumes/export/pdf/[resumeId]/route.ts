import { NextResponse } from "next/server";
import { jsPDF, type jsPDFOptions } from "jspdf";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { Resume, ResumeContent, Template } from "@/types/resume";

// Constants for PDF generation
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
  headerColor: [number, number, number];
  accentColor: [number, number, number];
  font: "helvetica" | "courier" | "times";
  spacing: number;
}

const templateStyles: Record<Template, TemplateStyles> = {
  professional: {
    headerSize: 24,
    sectionHeaderSize: 14,
    textSize: 11,
    headerColor: [0, 0, 0],
    accentColor: [0, 0, 255],
    font: "helvetica",
    spacing: 0.2
  },
  creative: {
    headerSize: 28,
    sectionHeaderSize: 16,
    textSize: 11,
    headerColor: [128, 0, 128],
    accentColor: [128, 0, 128],
    font: "helvetica",
    spacing: 0.25
  },
  technical: {
    headerSize: 22,
    sectionHeaderSize: 14,
    textSize: 10,
    headerColor: [0, 0, 128],
    accentColor: [0, 0, 255],
    font: "courier",
    spacing: 0.15
  },
  modern: {
    headerSize: 26,
    sectionHeaderSize: 15,
    textSize: 11,
    headerColor: [0, 128, 128],
    accentColor: [0, 128, 128],
    font: "helvetica",
    spacing: 0.22
  },
  executive: {
    headerSize: 24,
    sectionHeaderSize: 16,
    textSize: 11,
    headerColor: [64, 64, 64],
    accentColor: [0, 0, 0],
    font: "times",
    spacing: 0.23
  },
  minimal: {
    headerSize: 22,
    sectionHeaderSize: 13,
    textSize: 10,
    headerColor: [96, 96, 96],
    accentColor: [128, 128, 128],
    font: "helvetica",
    spacing: 0.18
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
    .replace(/\s+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();
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
  
  doc.setTextColor(...styles.accentColor);
  doc.text(sanitizedText, startX, y);
  
  doc.setLineWidth(0.02);
  doc.setDrawColor(...styles.accentColor);
  doc.line(startX, y + 0.02, startX + textWidth, y + 0.02);
  
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setFontSize(styles.textSize);
}

// Helper function to add text with line breaks and bullet points
function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, addBullet: boolean = false, styles: TemplateStyles): number {
  const sanitizedText = sanitizeText(text);
  if (!sanitizedText) return y;

  const lines = sanitizedText.split("\n").filter(Boolean).map(line => {
    line = line.trim();
    if (addBullet && !line.startsWith('•') && !line.startsWith('-')) {
      return `• ${line}`;
    }
    return line;
  });
  
  let currentY = y;
  for (const line of lines) {
    const wrappedLines = doc.splitTextToSize(line, maxWidth);
    for (const wrappedLine of wrappedLines) {
      currentY = checkPageBreak(doc, currentY);
      doc.text(wrappedLine, x, currentY);
      currentY += styles.spacing;
    }
    currentY += 0.05;
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
  doc.setTextColor(...styles.headerColor);
  doc.text(text, PAGE.MARGIN.LEFT, y);
  doc.setTextColor(0, 0, 0);
  return y + styles.spacing + 0.1;
}

// Helper function to set up the document with proper font encoding
function setupDocument(template: Template = 'professional'): jsPDF {
  const options: jsPDFOptions = {
    unit: "in",
    format: "letter",
    putOnlyUsedFonts: true,
    compress: true,
    hotfixes: ["px_scaling"]
  };

  const doc = new jsPDF(options);
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
  { params }: { params: { resumeId: string } }
) {
  let retries = 0;

  async function attemptExport(): Promise<Response> {
    try {
      console.log("Starting PDF export for resume:", params.resumeId);
      
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        return new NextResponse(
          JSON.stringify({ error: "Authentication error", details: sessionError }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!session) {
        console.error("No session found");
        return new NextResponse(
          JSON.stringify({ error: "No active session" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log("Authenticated user ID:", session.user.id);

      // Fetch resume data
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", params.resumeId)
        .eq("user_id", session.user.id)
        .single();

      if (resumeError) {
        console.error("Resume fetch error:", resumeError);
        return new NextResponse(
          JSON.stringify({ 
            error: "Resume not found", 
            details: resumeError,
            query: {
              resumeId: params.resumeId,
              userId: session.user.id
            }
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!resume) {
        console.error("Resume not found for ID:", params.resumeId);
        return new NextResponse(
          JSON.stringify({ 
            error: "Resume not found",
            query: {
              resumeId: params.resumeId,
              userId: session.user.id
            }
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log("Found resume:", resume.id, "for user:", session.user.id);

      // Validate resume content
      const content = resume.content as unknown as ResumeContent;
      if (!content?.personalInfo || !content?.experience || !content?.education || !content?.skills) {
        console.error("Invalid resume content structure:", content);
        return new NextResponse(
          JSON.stringify({ 
            error: "Invalid resume content",
            content: content
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generate PDF
      console.log("Generating PDF with template:", content.template);
      const template = content.template || 'professional';
      const styles = templateStyles[template];
      const doc = setupDocument(template);

      let currentY = PAGE.MARGIN.TOP;

      // Header section
      doc.setFontSize(styles.headerSize);
      doc.setFont(styles.font, "bold");
      doc.setTextColor(...styles.headerColor);
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

      // Certifications section
      if (Array.isArray(content.certifications) && content.certifications.length > 0) {
        currentY = addSectionHeader(doc, "Certifications", currentY, styles);

        doc.setFontSize(styles.textSize);
        for (const cert of content.certifications) {
          currentY = checkPageBreak(doc, currentY);
          
          doc.setFont(styles.font, "bold");
          doc.text(sanitizeText(cert.name), PAGE.MARGIN.LEFT, currentY);
          doc.text(sanitizeText(cert.date), PAGE.WIDTH - PAGE.MARGIN.RIGHT, currentY, { align: "right" });
          currentY += styles.spacing;
          doc.setFont(styles.font, "normal");
          doc.text(sanitizeText(cert.issuer), PAGE.MARGIN.LEFT, currentY);
          if (cert.url) {
            currentY += styles.spacing * 0.75;
            addLink(doc, sanitizeText(cert.url), PAGE.MARGIN.LEFT, currentY, styles);
          }
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

      // Update resume with file URL if storage is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log("Uploading PDF to storage");
        const fileName = `${resume.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('resumes')
          .upload(`${session.user.id}/${fileName}`, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
        } else if (uploadData) {
          console.log("PDF uploaded successfully:", uploadData);
          const { data: { publicUrl } } = supabase
            .storage
            .from('resumes')
            .getPublicUrl(`${session.user.id}/${fileName}`);

          const updatedContent = JSON.parse(JSON.stringify({
            ...content,
            file_url: publicUrl
          }));

          const { error: updateError } = await supabase
            .from('resumes')
            .update({ content: updatedContent })
            .eq('id', params.resumeId)
            .eq('user_id', session.user.id);

          if (updateError) {
            console.error("Error updating resume with file URL:", updateError);
          }
        }
      }

      console.log("Returning PDF response");
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${resume.name}-${new Date().toISOString().split('T')[0]}.pdf"`,
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
