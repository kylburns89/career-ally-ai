import { createClient } from "../../../../lib/supabase/server";
import { NextResponse } from "next/server";
import { createChatCompletion } from "../../../../lib/openai";

export async function GET() {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      console.error("[JOBS_RECOMMENDATIONS] Missing TOGETHER_API_KEY");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // Create a new supabase client
    const supabase = await createClient();

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Log auth state for debugging
    console.log("[JOBS_RECOMMENDATIONS] Auth state:", {
      hasSession: !!session,
      userId: session?.user?.id,
      error: sessionError?.message
    });

    if (sessionError) {
      console.error("[JOBS_RECOMMENDATIONS] Auth Error:", sessionError);
      return new NextResponse("Authentication error", { status: 401 });
    }
    
    if (!session?.user?.id) {
      console.error("[JOBS_RECOMMENDATIONS] No valid session");
      return new NextResponse("Unauthorized - No valid session", { status: 401 });
    }

    console.log("[JOBS_RECOMMENDATIONS] Authenticated user:", session.user.id);

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("[JOBS_RECOMMENDATIONS] Profile Error:", profileError);
      return new NextResponse("Error fetching profile", { status: 500 });
    }

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
