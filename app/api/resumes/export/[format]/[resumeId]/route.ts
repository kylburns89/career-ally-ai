import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(
  req: Request,
  { params }: { params: { format: string; resumeId: string } }
) {
  // Currently only PDF format is supported
  if (params.format.toLowerCase() === 'pdf') {
    // Redirect to the PDF-specific route
    return redirect(`/api/resumes/export/pdf/${params.resumeId}`);
  }

  // Return error for unsupported formats
  return new NextResponse(
    JSON.stringify({
      error: "Unsupported format",
      message: "Currently only PDF format is supported",
      requestedFormat: params.format
    }),
    { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
