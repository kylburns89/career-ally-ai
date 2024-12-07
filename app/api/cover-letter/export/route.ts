import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { content, format, title } = await request.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    if (format !== "pdf") {
      return new NextResponse("Only PDF format is supported", { status: 400 });
    }

    const filename = title ? 
      title.toLowerCase().replace(/\s+/g, '-') : 
      'cover-letter';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 1in;
              max-width: 8.5in;
            }
            p {
              margin-bottom: 1em;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${content.split('\n').map((line: string) => 
              line.trim() ? `<p>${line}</p>` : ''
            ).join('')}
          </div>
        </body>
      </html>
    `);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting cover letter:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
