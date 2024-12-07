import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

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

    // Launch browser with specific viewport
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport to A4 size
    await page.setViewport({
      width: 800,
      height: 1130, // Approximate A4 height at 96 DPI
      deviceScaleFactor: 2, // Increase resolution
    });

    // Inject required styles and content
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
            }
            @page {
              margin: 0;
              size: A4;
            }
            /* Ensure all content is visible in PDF */
            #resume {
              width: 100%;
              height: 100%;
              overflow: visible;
            }
            /* Force background colors to show in PDF */
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div id="resume">
            ${generateResumeHTML(resume.content)}
          </div>
          <script>
            // Wait for Tailwind to initialize
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(() => {
                window.status = 'ready';
              }, 1000);
            });
          </script>
        </body>
      </html>
    `, {
      waitUntil: 'networkidle0', // Wait for all network connections to finish
    });

    // Wait for styles and Tailwind to be applied
    await page.waitForFunction(() => {
      const style = window.getComputedStyle(document.body);
      return style.fontFamily.includes('Inter') && window.status === 'ready';
    }, { timeout: 5000 });

    // Generate PDF with specific settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function generateResumeHTML(content: any) {
  // Generate HTML based on the template and content
  const template = content.template || "professional";
  
  // You can create different HTML structures for each template
  switch (template) {
    case "professional":
      return generateProfessionalHTML(content);
    case "creative":
      return generateCreativeHTML(content);
    case "technical":
      return generateTechnicalHTML(content);
    case "modern":
      return generateModernHTML(content);
    case "executive":
      return generateExecutiveHTML(content);
    case "minimal":
      return generateMinimalHTML(content);
    default:
      return generateProfessionalHTML(content);
  }
}

function generateProfessionalHTML(content: any) {
  return `
    <div class="max-w-[800px] mx-auto p-8 bg-white">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">${content.personalInfo.fullName}</h1>
        <div class="text-gray-600 space-x-4">
          <span>${content.personalInfo.email}</span>
          <span>•</span>
          <span>${content.personalInfo.phone}</span>
          <span>•</span>
          <span>${content.personalInfo.location}</span>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Experience</h2>
        ${content.experience.map((exp: any) => `
          <div class="mb-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-800">${exp.title}</h3>
                <div class="text-gray-600">${exp.company}</div>
              </div>
              <div class="text-gray-600">${exp.duration}</div>
            </div>
            <p class="text-gray-700 mt-2">${exp.description}</p>
          </div>
        `).join("")}
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Education</h2>
        ${content.education.map((edu: any) => `
          <div class="mb-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-800">${edu.degree}</h3>
                <div class="text-gray-600">${edu.school}</div>
              </div>
              <div class="text-gray-600">${edu.year}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <div>
        <h2 class="text-xl font-bold text-gray-800 border-b-2 border-gray-300 mb-4">Skills</h2>
        <div class="flex flex-wrap gap-2">
          ${content.skills.map((skill: string) => `
            <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
              ${skill}
            </span>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Add other template generation functions here...
function generateCreativeHTML(content: any) {
  return `
    <div class="max-w-[800px] mx-auto p-8 bg-white">
      <div class="bg-purple-600 text-white p-8 -mx-8 -mt-8 mb-8">
        <h1 class="text-4xl font-bold mb-4">${content.personalInfo.fullName}</h1>
        <div class="flex flex-wrap gap-4 text-purple-100">
          <span>${content.personalInfo.email}</span>
          <span>${content.personalInfo.phone}</span>
          <span>${content.personalInfo.location}</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-8">
        <div class="col-span-2">
          <h2 class="text-2xl font-bold text-purple-600 mb-6">Experience</h2>
          ${content.experience.map((exp: any) => `
            <div class="mb-6">
              <h3 class="font-bold text-lg">${exp.title}</h3>
              <div class="text-purple-600 font-medium">${exp.company}</div>
              <div class="text-gray-600 text-sm mb-2">${exp.duration}</div>
              <p class="text-gray-700">${exp.description}</p>
            </div>
          `).join("")}

          <h2 class="text-2xl font-bold text-purple-600 mt-8 mb-6">Education</h2>
          ${content.education.map((edu: any) => `
            <div class="mb-4">
              <h3 class="font-bold text-lg">${edu.degree}</h3>
              <div class="text-purple-600">${edu.school}</div>
              <div class="text-gray-600 text-sm">${edu.year}</div>
            </div>
          `).join("")}
        </div>

        <div>
          <h2 class="text-2xl font-bold text-purple-600 mb-6">Skills</h2>
          <div class="flex flex-col gap-2">
            ${content.skills.map((skill: string) => `
              <span class="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-center">
                ${skill}
              </span>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add implementations for other templates...
function generateTechnicalHTML(content: any) {
  return generateProfessionalHTML(content); // Fallback to professional for now
}

function generateModernHTML(content: any) {
  return generateProfessionalHTML(content); // Fallback to professional for now
}

function generateExecutiveHTML(content: any) {
  return generateProfessionalHTML(content); // Fallback to professional for now
}

function generateMinimalHTML(content: any) {
  return generateProfessionalHTML(content); // Fallback to professional for now
}
