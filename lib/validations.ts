import { z } from 'zod';
import type { ResumeData } from '@/types/resume';

const VALID_TEMPLATES = ['professional', 'creative', 'technical', 'modern', 'executive', 'minimal'] as const;

export const resumeContentSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
  }),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string(),
  })),
  education: z.array(z.object({
    degree: z.string(),
    school: z.string(),
    year: z.string(),
  })),
  skills: z.array(z.string()),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.string(),
    link: z.string().url().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    link: z.string().url().optional(),
  })).optional(),
  template: z.enum(VALID_TEMPLATES).nullable(),
  sections: z.array(z.string()).optional(),
});

// For backward compatibility
export const resumeSchema = resumeContentSchema;

export function validateData<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Invalid data format' };
  }
}
