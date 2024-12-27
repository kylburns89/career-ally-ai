import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { prisma } from "../../../../lib/prisma";
import { createChatCompletion } from "../../../../lib/openai";

export async function GET() {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      console.error("[JOBS_RECOMMENDATIONS] Missing TOGETHER_API_KEY");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error("[JOBS_RECOMMENDATIONS] No valid session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("[JOBS_RECOMMENDATIONS] Authenticated user:", session.user.email);

    // Get user's profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      console.error("[JOBS_RECOMMENDATIONS] User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json({ 
        error: "Please complete your profile to get personalized job recommendations" 
      }, { status: 400 });
    }

    // Create a prompt based on the user's profile
    const prompt = `Based on the following professional profile, suggest 5 suitable job roles with brief descriptions. Return ONLY the JSON object with no additional formatting or markdown.

    Profile:
    - Title: ${user.profile.headline || 'Not specified'}
    - Summary: ${user.profile.summary || 'Not specified'}
    - Skills: ${user.profile.skills?.join(', ') || 'Not specified'}
    - Location: ${user.profile.location || 'Not specified'}
    - Experience: ${JSON.stringify(user.profile.experience) || 'Not specified'}
    - Education: ${JSON.stringify(user.profile.education) || 'Not specified'}
    - Certifications: ${JSON.stringify(user.profile.certifications) || 'Not specified'}
    
    The response should be EXACTLY in this format with no additional text or formatting:
    {
      "recommendations": [
        {
          "title": "Job Title",
          "description": "Brief job description and why it's a good fit based on the profile",
          "estimatedSalary": "Salary range based on experience and skills",
          "requiredSkills": ["skill1", "skill2", "skill3"],
          "matchScore": 85
        }
      ]
    }`;

    const content = await createChatCompletion(
      [
        { 
          role: "system", 
          content: "You are a career advisor specializing in tech industry job recommendations. Always respond with pure JSON, no markdown formatting or additional text." 
        },
        { role: "user", content: prompt }
      ],
      {
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        temperature: 0.7
      }
    );

    if (!content) {
      console.error("[JOBS_RECOMMENDATIONS] No content generated");
      throw new Error("Failed to generate recommendations");
    }

    // Clean the response to ensure it's valid JSON
    const cleanedContent = content
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove any extra whitespace

    try {
      const recommendations = JSON.parse(cleanedContent);
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error("[JOBS_RECOMMENDATIONS] JSON Parse Error:", parseError);
      console.error("[JOBS_RECOMMENDATIONS] Raw Content:", content);
      console.error("[JOBS_RECOMMENDATIONS] Cleaned Content:", cleanedContent);
      throw new Error("Failed to parse recommendations");
    }
  } catch (error: any) {
    console.error("[JOBS_RECOMMENDATIONS]", error);
    return new NextResponse(
      error.message || "Internal Error", 
      { status: error.status || 500 }
    );
  }
}
