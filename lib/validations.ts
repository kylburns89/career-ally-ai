import { z } from "zod"

// Resume validations
export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
})

export const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().min(1, "Description is required"),
})

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School name is required"),
  year: z.string().min(1, "Year is required"),
})

export const resumeContentSchema = z.object({
  personalInfo: personalInfoSchema,
  experience: z.array(experienceSchema).min(1, "At least one experience entry is required"),
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
  skills: z.array(z.string()).default([]),
  template: z.string(),
})

export const resumeSchema = z.object({
  name: z.string().min(1, "Resume name is required"),
  content: resumeContentSchema,
})

// Profile validations
export const profileSchema = z.object({
  title: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  yearsExperience: z.number().nullable(),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
  education: z.array(z.any()),
  workHistory: z.array(z.any()),
  desiredSalary: z.number().nullable(),
  desiredLocation: z.string().nullable(),
  remoteOnly: z.boolean(),
  linkedin: z.string().url().nullable(),
  github: z.string().url().nullable(),
  portfolio: z.string().url().nullable(),
})

// Application validations
export const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEWING",
    "OFFERED",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  appliedDate: z.string(),
  resumeId: z.string().nullable(),
  coverLetterId: z.string().nullable(),
  notes: z.string().nullable(),
  nextSteps: z.string().nullable(),
  salary: z.number().nullable(),
  location: z.string().nullable(),
  jobPostUrl: z.string().url().nullable(),
})

// Chat validations
export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  timestamp: z.string().optional(),
})

export const chatHistorySchema = z.object({
  type: z.enum(["INTERVIEW", "SALARY", "TECHNICAL"]),
  messages: z.array(chatMessageSchema),
  metadata: z.any().nullable(),
})

// Helper function to validate data against a schema
export async function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validData = await schema.parseAsync(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errors }
    }
    return { success: false, error: "Validation failed" }
  }
}
