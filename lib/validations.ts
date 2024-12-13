import { z } from 'zod';
import type { ResumeData } from '../types/resume';

const VALID_TEMPLATES = ['professional', 'creative', 'technical', 'modern', 'executive', 'minimal'] as const;

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
  name: z.string().optional(), // For backward compatibility
});

const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().min(1, "Job description is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School name is required"),
  year: z.string().min(1, "Graduation year is required"),
  graduationDate: z.string().optional(), // For backward compatibility
});

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
  technologies: z.union([
    z.string(),
    z.array(z.string())
  ]).transform(val => {
    if (Array.isArray(val)) return val;
    return val.split(',').map(t => t.trim()).filter(Boolean);
  }),
  url: z.string().url().optional(),
  link: z.string().url().optional(), // For backward compatibility
});

const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer name is required"),
  date: z.string().min(1, "Date is required"),
  url: z.string().url().optional(),
});

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().default(""),
  experience: z.array(experienceSchema).min(1, "At least one experience entry is required"),
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  projects: z.array(projectSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
  template: z.enum(VALID_TEMPLATES).nullable(),
  sections: z.array(z.string()).optional().default([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ]),
});

// For backward compatibility
export const resumeSchema = resumeContentSchema;

export async function validateData<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      return { success: false, error: errors.join(', ') };
    }
    return { success: false, error: 'Invalid data format' };
  }
}

export function isValidTemplate(template: unknown): template is typeof VALID_TEMPLATES[number] {
  return typeof template === 'string' && VALID_TEMPLATES.includes(template as any);
}
