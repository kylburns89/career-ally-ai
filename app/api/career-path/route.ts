import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateCareerPath } from '../../../lib/openai';
import { authOptions } from "../auth/auth-options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { useProfile, careerInput } = await req.json();
    let prompt = '';
    
    if (useProfile) {
      const profile = await prisma.profile.findUnique({
        where: {
          userId: session.user.id
        }
      });

      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }

      const experience = profile.experience as Array<{ title: string; company: string }>;
      const education = profile.education as Array<{ degree: string; field: string }>;
      const certifications = profile.certifications as Array<{ name: string }>;

      prompt = `You are a career progression expert. Analyze the following profile and generate a detailed career path. Return ONLY a JSON object with no additional text. The response must start with "{" and end with "}".

Profile Information:
Current Title: ${profile.headline || 'Not specified'}
Skills: ${profile.skills?.join(', ') || 'Not specified'}
Location: ${profile.location || 'Not specified'}
Education: ${education?.map(edu => `${edu.degree} in ${edu.field}`).join(', ') || 'Not specified'}
Experience: ${experience?.map(exp => `${exp.title} at ${exp.company}`).join(', ') || 'Not specified'}
Certifications: ${certifications?.map(cert => cert.name).join(', ') || 'Not specified'}

The response must exactly match this structure:
{
  "career_steps": [
    {
      "title": "Role title",
      "timeline": "Timeline description",
      "required_skills": ["Skill 1", "Skill 2"],
      "certifications": ["Cert 1", "Cert 2"],
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ]
}`;
    } else {
      prompt = `You are a career progression expert. Generate a detailed career path for someone interested in becoming a ${careerInput}. Return ONLY a JSON object with no additional text. The response must start with "{" and end with "}".

The response must exactly match this structure:
{
  "career_steps": [
    {
      "title": "Role title",
      "timeline": "Timeline description",
      "required_skills": ["Skill 1", "Skill 2"],
      "certifications": ["Cert 1", "Cert 2"],
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ]
}`;
    }

    const response = await generateCareerPath(prompt, {
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      temperature: 0.7
    });

    // Parse the response and ensure it has the expected structure
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      if (!parsedResponse.career_steps || !Array.isArray(parsedResponse.career_steps)) {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error parsing career path response:', error);
      return NextResponse.json(
        { error: 'Failed to generate career path. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Career path generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career path' },
      { status: 500 }
    );
  }
}
