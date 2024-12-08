import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";

// Helper function to format description text into bullet points
function formatDescription(description: string): string[] {
  return description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      if (line.startsWith('•') || line.startsWith('-')) {
        return line.substring(1).trim();
      }
      return line;
    });
}

export async function GET(
  request: Request,
  { params }: { params: { format: string; resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch resume data
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (resumeError || !resume) {
      return new NextResponse("Resume not found", { status: 404 });
    }

    // Only support PDF format
    if (params.format !== "pdf") {
      return new NextResponse("Only PDF format is supported", { status: 400 });
    }

    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Generate PDF based on template
    switch (resume.content.template) {
      case 'creative':
        generateCreativePDF(doc, resume.content);
        break;
      case 'technical':
        generateTechnicalPDF(doc, resume.content);
        break;
      case 'modern':
        generateModernPDF(doc, resume.content);
        break;
      case 'executive':
        generateExecutivePDF(doc, resume.content);
        break;
      case 'minimal':
        generateMinimalPDF(doc, resume.content);
        break;
      default:
        generateProfessionalPDF(doc, resume.content);
    }

    // Get PDF as Uint8Array for better handling in serverless environment
    const pdfBuffer = doc.output('arraybuffer');
    const pdfArray = new Uint8Array(pdfBuffer);

    // Return PDF with proper headers
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume.pdf"`,
        'Content-Length': pdfArray.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function generateProfessionalPDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const nameWidth = doc.getTextDimensions(content.personalInfo.fullName).w;
  doc.text(content.personalInfo.fullName, (pageWidth - nameWidth) / 2, yPos);
  yPos += 10;

  // Contact Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contactInfo = `${content.personalInfo.email} • ${content.personalInfo.phone} • ${content.personalInfo.location}`;
  const contactWidth = doc.getTextDimensions(contactInfo).w;
  doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
  yPos += 15;

  // Experience Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Experience", margin, yPos);
  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
  yPos += 8;

  content.experience.forEach((exp: any) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(exp.title, margin, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const companyText = `${exp.company} - ${exp.duration}`;
    doc.text(companyText, margin, yPos + 5);
    
    yPos += 10;
    const bullets = formatDescription(exp.description);
    bullets.forEach(bullet => {
      doc.text(`• ${bullet}`, margin + 5, yPos);
      const splitBullet = doc.splitTextToSize(`• ${bullet}`, pageWidth - (2 * margin) - 5);
      yPos += splitBullet.length * 5;
    });
    
    yPos += 5;
    
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Education Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Education", margin, yPos);
  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
  yPos += 8;

  content.education.forEach((edu: any) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(edu.degree, margin, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${edu.school} - ${edu.year}`, margin, yPos + 5);
    
    yPos += 12;
    
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Skills Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Skills", margin, yPos);
  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const skillsText = content.skills.join(" • ");
  const splitSkills = doc.splitTextToSize(skillsText, pageWidth - (2 * margin));
  doc.text(splitSkills, margin, yPos);
}

function generateCreativePDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header with purple background
  doc.setFillColor(147, 51, 234); // Purple background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const nameWidth = doc.getTextDimensions(content.personalInfo.fullName).w;
  doc.text(content.personalInfo.fullName, (pageWidth - nameWidth) / 2, yPos);
  yPos += 10;

  doc.setFontSize(10);
  const contactInfo = `${content.personalInfo.email} • ${content.personalInfo.phone} • ${content.personalInfo.location}`;
  const contactWidth = doc.getTextDimensions(contactInfo).w;
  doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
  yPos += 25;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Two-column layout
  const columnWidth = (pageWidth - (3 * margin)) / 2;
  let leftColumnY = yPos;
  let rightColumnY = yPos;

  // Left column (Experience and Education)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(147, 51, 234);
  doc.text("Experience", margin, leftColumnY);
  leftColumnY += 8;

  doc.setTextColor(0, 0, 0);
  content.experience.forEach((exp: any) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(exp.title, margin, leftColumnY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(147, 51, 234);
    doc.text(exp.company, margin, leftColumnY + 5);
    doc.setTextColor(128, 128, 128);
    doc.text(exp.duration, margin, leftColumnY + 10);
    
    leftColumnY += 15;
    doc.setTextColor(0, 0, 0);
    const bullets = formatDescription(exp.description);
    bullets.forEach(bullet => {
      const splitBullet = doc.splitTextToSize(`• ${bullet}`, columnWidth);
      doc.text(splitBullet, margin, leftColumnY);
      leftColumnY += splitBullet.length * 5;
    });
    
    leftColumnY += 5;
  });

  // Right column (Skills)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(147, 51, 234);
  doc.text("Skills", 2 * margin + columnWidth, rightColumnY);
  rightColumnY += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  content.skills.forEach((skill: string) => {
    doc.setFillColor(247, 237, 255);
    const skillWidth = doc.getTextDimensions(skill).w + 4;
    doc.roundedRect(2 * margin + columnWidth, rightColumnY - 4, skillWidth, 8, 2, 2, 'F');
    doc.text(skill, 2 * margin + columnWidth + 2, rightColumnY);
    rightColumnY += 10;
  });
}

function generateTechnicalPDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header with monospace font and blue accent
  doc.setFont("courier", "bold");
  doc.setFontSize(20);
  doc.text(content.personalInfo.fullName, margin, yPos);
  yPos += 8;

  // Contact info with icons
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text(`📧 ${content.personalInfo.email}`, margin, yPos);
  yPos += 5;
  doc.text(`📱 ${content.personalInfo.phone}`, margin, yPos);
  yPos += 5;
  doc.text(`📍 ${content.personalInfo.location}`, margin, yPos);
  yPos += 15;

  // Experience Section
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 122, 255); // Blue color
  doc.text("<Experience />", margin, yPos);
  yPos += 8;

  doc.setTextColor(0, 0, 0);
  content.experience.forEach((exp: any) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(exp.title, margin, yPos);
    
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 122, 255);
    doc.text(exp.company, margin, yPos + 5);
    doc.setTextColor(128, 128, 128);
    doc.text(exp.duration, margin, yPos + 10);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    const bullets = formatDescription(exp.description);
    bullets.forEach(bullet => {
      const splitBullet = doc.splitTextToSize(`> ${bullet}`, pageWidth - (2 * margin));
      doc.text(splitBullet, margin, yPos);
      yPos += splitBullet.length * 5;
    });
    
    yPos += 5;
    
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Education Section
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 122, 255);
  doc.text("<Education />", margin, yPos);
  yPos += 8;

  doc.setTextColor(0, 0, 0);
  content.education.forEach((edu: any) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(edu.degree, margin, yPos);
    
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text(`${edu.school} - ${edu.year}`, margin, yPos + 5);
    
    yPos += 12;
  });

  // Skills Section
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 122, 255);
  doc.text("<Skills />", margin, yPos);
  yPos += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  const skillsPerRow = 3;
  for (let i = 0; i < content.skills.length; i += skillsPerRow) {
    const rowSkills = content.skills.slice(i, i + skillsPerRow);
    const skillText = rowSkills.join("    ");
    doc.text(skillText, margin, yPos);
    yPos += 6;
  }
}

function generateModernPDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header with emerald accent
  doc.setFont("helvetica", "light");
  doc.setFontSize(28);
  doc.text(content.personalInfo.fullName, margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // Emerald color
  const contactInfo = `${content.personalInfo.email} • ${content.personalInfo.phone} • ${content.personalInfo.location}`;
  doc.text(contactInfo, margin, yPos);
  yPos += 15;

  // Sections
  const sections = ['Experience', 'Education', 'Skills'];
  sections.forEach((section, index) => {
    if (index > 0) yPos += 10;

    doc.setFont("helvetica", "light");
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text(section, margin, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    switch (section) {
      case 'Experience':
        content.experience.forEach((exp: any) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          const titleWidth = doc.getTextDimensions(exp.title).w;
          doc.text(exp.title, margin, yPos);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(exp.duration, pageWidth - margin - doc.getTextDimensions(exp.duration).w, yPos);
          
          doc.setTextColor(16, 185, 129);
          doc.text(exp.company, margin, yPos + 5);
          
          yPos += 10;
          doc.setTextColor(0, 0, 0);
          const bullets = formatDescription(exp.description);
          bullets.forEach(bullet => {
            const splitBullet = doc.splitTextToSize(`• ${bullet}`, pageWidth - (2 * margin));
            doc.text(splitBullet, margin, yPos);
            yPos += splitBullet.length * 5;
          });
          
          yPos += 5;
        });
        break;

      case 'Education':
        content.education.forEach((edu: any) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(edu.degree, margin, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(edu.year, pageWidth - margin - doc.getTextDimensions(edu.year).w, yPos);
          
          doc.setTextColor(16, 185, 129);
          doc.text(edu.school, margin, yPos + 5);
          
          yPos += 10;
          doc.setTextColor(0, 0, 0);
        });
        break;

      case 'Skills':
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const skillsPerRow = Math.floor((pageWidth - 2 * margin) / 30);
        for (let i = 0; i < content.skills.length; i += skillsPerRow) {
          const rowSkills = content.skills.slice(i, i + skillsPerRow);
          const skillText = rowSkills.join(" • ");
          doc.text(skillText, margin, yPos);
          yPos += 6;
        }
        break;
    }
  });
}

function generateExecutivePDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let yPos = 30;

  // Elegant header with double border
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  const nameWidth = doc.getTextDimensions(content.personalInfo.fullName).w;
  doc.text(content.personalInfo.fullName, (pageWidth - nameWidth) / 2, yPos);
  yPos += 15;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const contactInfo = `${content.personalInfo.email} • ${content.personalInfo.phone} • ${content.personalInfo.location}`;
  const contactWidth = doc.getTextDimensions(contactInfo).w;
  doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
  yPos += 5;

  // Double border under header
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
  doc.line(margin, yPos + 7, pageWidth - margin, yPos + 7);
  yPos += 20;

  // Sections with centered headings
  const sections = ['Professional Experience', 'Education', 'Areas of Expertise'];
  sections.forEach((section, index) => {
    if (index > 0) yPos += 15;

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    const sectionWidth = doc.getTextDimensions(section).w;
    doc.text(section, (pageWidth - sectionWidth) / 2, yPos);
    yPos += 10;

    switch (section) {
      case 'Professional Experience':
        content.experience.forEach((exp: any) => {
          doc.setFont("times", "bold");
          doc.setFontSize(12);
          doc.text(exp.title, margin, yPos);
          doc.setFont("times", "normal");
          doc.text(exp.duration, pageWidth - margin - doc.getTextDimensions(exp.duration).w, yPos);
          
          doc.setFont("times", "italic");
          doc.text(exp.company, margin, yPos + 5);
          
          yPos += 10;
          doc.setFont("times", "normal");
          const bullets = formatDescription(exp.description);
          bullets.forEach(bullet => {
            const splitBullet = doc.splitTextToSize(`• ${bullet}`, pageWidth - (2 * margin));
            doc.text(splitBullet, margin, yPos);
            yPos += splitBullet.length * 5;
          });
          
          yPos += 5;
        });
        break;

      case 'Education':
        content.education.forEach((edu: any) => {
          doc.setFont("times", "bold");
          doc.setFontSize(12);
          const degreeWidth = doc.getTextDimensions(edu.degree).w;
          doc.text(edu.degree, (pageWidth - degreeWidth) / 2, yPos);
          
          doc.setFont("times", "italic");
          const schoolWidth = doc.getTextDimensions(edu.school).w;
          doc.text(edu.school, (pageWidth - schoolWidth) / 2, yPos + 5);
          
          doc.setFont("times", "normal");
          const yearWidth = doc.getTextDimensions(edu.year).w;
          doc.text(edu.year, (pageWidth - yearWidth) / 2, yPos + 10);
          
          yPos += 15;
        });
        break;

      case 'Areas of Expertise':
        const skillsPerRow = 3;
        for (let i = 0; i < content.skills.length; i += skillsPerRow) {
          const rowSkills = content.skills.slice(i, i + skillsPerRow);
          const skillText = rowSkills.join(" • ");
          const skillWidth = doc.getTextDimensions(skillText).w;
          doc.setFont("times", "normal");
          doc.text(skillText, (pageWidth - skillWidth) / 2, yPos);
          yPos += 6;
        }
        break;
    }
  });
}

function generateMinimalPDF(doc: jsPDF, content: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let yPos = 30;

  // Clean, minimal header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.text(content.personalInfo.fullName, margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.text(content.personalInfo.email, margin, yPos);
  doc.text(content.personalInfo.phone, margin, yPos + 4);
  doc.text(content.personalInfo.location, margin, yPos + 8);
  yPos += 20;

  // Sections with minimal styling
  const sections = ['Experience', 'Education', 'Skills'];
  sections.forEach((section, index) => {
    if (index > 0) yPos += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(section.toUpperCase(), margin, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    switch (section) {
      case 'Experience':
        content.experience.forEach((exp: any) => {
          doc.setFont("helvetica", "medium");
          doc.setFontSize(11);
          doc.text(exp.title, margin, yPos);
          doc.text(exp.duration, pageWidth - margin - doc.getTextDimensions(exp.duration).w, yPos);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(exp.company, margin, yPos + 5);
          
          yPos += 10;
          const bullets = formatDescription(exp.description);
          bullets.forEach(bullet => {
            const splitBullet = doc.splitTextToSize(`• ${bullet}`, pageWidth - (2 * margin));
            doc.text(splitBullet, margin, yPos);
            yPos += splitBullet.length * 5;
          });
          
          yPos += 5;
        });
        break;

      case 'Education':
        content.education.forEach((edu: any) => {
          doc.setFont("helvetica", "medium");
          doc.setFontSize(11);
          doc.text(edu.degree, margin, yPos);
          doc.text(edu.year, pageWidth - margin - doc.getTextDimensions(edu.year).w, yPos);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(edu.school, margin, yPos + 5);
          
          yPos += 12;
        });
        break;

      case 'Skills':
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const skillsText = content.skills.join(" • ");
        const splitSkills = doc.splitTextToSize(skillsText, pageWidth - (2 * margin));
        doc.text(splitSkills, margin, yPos);
        yPos += splitSkills.length * 5;
        break;
    }
  });
}
