import { Database } from "@/types/database";

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Resume types
export type Resume = Tables<'resumes'>
export type Profile = Tables<'profiles'>
export type CoverLetter = Tables<'cover_letters'>
export type Application = Tables<'applications'>
export type ChatHistory = Tables<'chat_histories'>

// Application status type
export const ApplicationStatus = {
  SAVED: 'SAVED',
  APPLIED: 'APPLIED',
  INTERVIEWING: 'INTERVIEWING',
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus]

// Chat type
export const ChatType = {
  INTERVIEW: 'INTERVIEW',
  SALARY: 'SALARY',
  TECHNICAL: 'TECHNICAL',
} as const;

export type ChatType = typeof ChatType[keyof typeof ChatType]

// Resume data types
export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  template: string; // Changed from string | null to string to match validation schema
}

export interface SavedResume {
  id?: string;
  name: string;
  content: ResumeData;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
