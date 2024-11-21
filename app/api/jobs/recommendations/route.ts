import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/openai";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ 
        error: "Please complete your profile to get personalized job recommendations" 
      }, { status: 400 });
    }

    // Create a prompt based on the user's profile
    const prompt = `Based on the following professional profile, suggest 5 suitable job roles with brief descriptions. Return ONLY the JSON object with no additional formatting or markdown.

    Profile:
    - Title: ${profile.title || 'Not specified'}
    - Skills: ${profile.skills?.join(', ') || 'Not specified'}
    - Years of Experience: ${profile.years_experience || 'Not specified'}
    - Industries: ${profile.industries?.join(', ') || 'Not specified'}
    - Desired Salary: ${profile.desired_salary ? '$' + profile.desired_salary : 'Not specified'}
    - Desired Location: ${profile.desired_location || 'Not specified'}
    - Remote Only: ${profile.remote_only ? 'Yes' : 'No'}
    
    The response should be EXACTLY in this format with no additional text or formatting:
    {
      "recommendations": [
        {
          "title": "Job Title",
          "description": "Brief job description and why it's a good fit",
          "estimatedSalary": "Salary range",
          "requiredSkills": ["skill1", "skill2"],
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
        model: "gpt-4o-mini",
        temperature: 0.7
      }
    );

    if (!content) {
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
      console.error("JSON Parse Error:", parseError);
      console.error("Raw Content:", content);
      console.error("Cleaned Content:", cleanedContent);
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
