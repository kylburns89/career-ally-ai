export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Resume content types
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface ResumeAnalysis {
  strengths: string[];
  suggestions: string[];
  generated_at: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  template: string;
}

// Database types
export interface Resume {
  id: string;
  user_id: string;
  name: string;
  content: ResumeContent;
  analysis: ResumeAnalysis | null;
  created_at: string;
  updated_at: string;
}

// Type used in the resume builder form
export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  template: string;
}

export interface SavedResume {
  name: string;
  content: ResumeContent;
  analysis?: ResumeAnalysis;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          title: string | null
          bio: string | null
          location: string | null
          years_experience: number | null
          skills: string[]
          industries: string[]
          education: Json[]
          work_history: Json[]
          desired_salary: number | null
          desired_location: string | null
          remote_only: boolean
          linkedin: string | null
          github: string | null
          portfolio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title?: string | null
          bio?: string | null
          location?: string | null
          years_experience?: number | null
          skills?: string[]
          industries?: string[]
          education?: Json[]
          work_history?: Json[]
          desired_salary?: number | null
          desired_location?: string | null
          remote_only?: boolean
          linkedin?: string | null
          github?: string | null
          portfolio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          bio?: string | null
          location?: string | null
          years_experience?: number | null
          skills?: string[]
          industries?: string[]
          education?: Json[]
          work_history?: Json[]
          desired_salary?: number | null
          desired_location?: string | null
          remote_only?: boolean
          linkedin?: string | null
          github?: string | null
          portfolio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          content: ResumeContent
          analysis: ResumeAnalysis | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: ResumeContent
          analysis?: ResumeAnalysis | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: ResumeContent
          analysis?: ResumeAnalysis | null
          created_at?: string
          updated_at?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          job_title: string | null
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          job_title?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          job_title?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          company: string
          job_title: string
          status: string
          applied_date: string
          resume_id: string | null
          cover_letter_id: string | null
          notes: string | null
          next_steps: string | null
          salary: number | null
          location: string | null
          job_post_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          job_title: string
          status: string
          applied_date: string
          resume_id?: string | null
          cover_letter_id?: string | null
          notes?: string | null
          next_steps?: string | null
          salary?: number | null
          location?: string | null
          job_post_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          job_title?: string
          status?: string
          applied_date?: string
          resume_id?: string | null
          cover_letter_id?: string | null
          notes?: string | null
          next_steps?: string | null
          salary?: number | null
          location?: string | null
          job_post_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_histories: {
        Row: {
          id: string
          user_id: string
          type: string
          messages: Json[]
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          messages: Json[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          messages?: Json[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
