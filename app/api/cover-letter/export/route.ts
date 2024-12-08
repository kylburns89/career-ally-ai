import { NextResponse } from "next/server";
import jsPDF from "jspdf";

interface CoverLetterData {
  content: string;
  format: string;
  title: string;
  template?: string;
}

export async function POST(request: Request) {
  try {
    const { content, format, title, template = "professional" }: CoverLetterData = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    if (format !== "pdf") {
      return new NextResponse("Only PDF format is supported", { status: 400 });
    }

    const filename = title ? 
      title.toLowerCase().replace(/\s+/g, '-') : 
      'cover-letter';

    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Generate PDF based on template
    switch (template) {
      case 'creative':
        generateCreativePDF(doc, content);
        break;
      case 'technical':
        generateTechnicalPDF(doc, content);
        break;
      default:
        generateProfessionalPDF(doc, content);
    }

    // Get PDF as Uint8Array for better handling in serverless environment
    const pdfBuffer = doc.output('arraybuffer');
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": pdfArray.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting cover letter:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function generateProfessionalPDF(doc: jsPDF, content: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4; // 1 inch margin
  let yPos = margin;

  // Set professional font
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  // Current date
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(date, margin, yPos);
  yPos += 15;

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());

  // Process each paragraph
  paragraphs.forEach((paragraph) => {
    // Calculate height needed for this paragraph
    const lines = doc.splitTextToSize(paragraph, pageWidth - (2 * margin));
    const paragraphHeight = lines.length * 5;

    // Check if we need a new page
    if (yPos + paragraphHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    // Add the paragraph
    doc.text(lines, margin, yPos);
    yPos += paragraphHeight + 5; // Add extra spacing between paragraphs
  });
}

function generateCreativePDF(doc: jsPDF, content: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4;
  let yPos = margin;

  // Add modern header with accent color
  doc.setFillColor(100, 100, 255); // Blue accent
  doc.rect(0, 0, pageWidth, 15, 'F');

  // Set modern font
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  // Current date with modern formatting
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(date, margin, yPos);
  yPos += 15;

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());

  // Process each paragraph with modern styling
  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, pageWidth - (2 * margin));
    const paragraphHeight = lines.length * 5;

    if (yPos + paragraphHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    // Add subtle left border to paragraphs
    doc.setDrawColor(100, 100, 255);
    doc.setLineWidth(0.5);
    doc.line(margin - 5, yPos - 2, margin - 5, yPos + paragraphHeight);

    doc.text(lines, margin, yPos);
    yPos += paragraphHeight + 7; // Increased spacing for modern look
  });
}

function generateTechnicalPDF(doc: jsPDF, content: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25.4;
  let yPos = margin;

  // Set monospace font for technical look
  doc.setFont("courier", "normal");
  doc.setFontSize(11);

  // Add technical header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, margin - 10, pageWidth - (2 * margin), 15, 'F');
  
  // Current date with technical formatting
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  doc.text(`// ${date}`, margin, yPos);
  yPos += 15;

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());

  // Process each paragraph with technical styling
  paragraphs.forEach((paragraph, index) => {
    const lines = doc.splitTextToSize(paragraph, pageWidth - (2 * margin));
    const paragraphHeight = lines.length * 5;

    if (yPos + paragraphHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    // Add comment-style markers for visual interest
    if (index === 0) {
      doc.text('/* Introduction */', margin, yPos - 5);
      yPos += 5;
    } else if (index === paragraphs.length - 1) {
      doc.text('/* Closing */', margin, yPos - 5);
      yPos += 5;
    }

    doc.text(lines, margin, yPos);
    yPos += paragraphHeight + 7;
  });
}
