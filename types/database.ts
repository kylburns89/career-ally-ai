export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ResumeData {
  name: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
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
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
  template: string | null;
  sections?: string[];
}

export interface SavedResume {
  id?: string;
  user_id?: string;
  name: string;
  content: ResumeData;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      resume_analyses: {
        Row: {
          id: string
          resume_id: string
          resume_content: Json
          analysis: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          resume_content: Json
          analysis: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          resume_content?: Json
          analysis?: Json
          created_at?: string
          updated_at?: string
        }
      }
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
          experience: Json[]
          certifications: string[]
          created_at: string
          updated_at: string
          desired_salary: number | null
          desired_location: string | null
          remote_only: boolean
          linkedin: string | null
          github: string | null
          portfolio: string | null
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
          experience?: Json[]
          certifications?: string[]
          created_at?: string
          updated_at?: string
          desired_salary?: number | null
          desired_location?: string | null
          remote_only?: boolean
          linkedin?: string | null
          github?: string | null
          portfolio?: string | null
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
          experience?: Json[]
          certifications?: string[]
          created_at?: string
          updated_at?: string
          desired_salary?: number | null
          desired_location?: string | null
          remote_only?: boolean
          linkedin?: string | null
          github?: string | null
          portfolio?: string | null
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
          notes: string | null
          resume_id: string | null
          cover_letter_id: string | null
          contact_id: string | null
          created_at: string
          updated_at: string
          response_date: string | null
          interview_date: string | null
          offer_date: string | null
          rejection_date: string | null
          follow_up_dates: string[] | null
          interview_feedback: string | null
          salary_offered: number | null
          application_method: string | null
          application_source: string | null
          interview_rounds: number
          interview_types: string[] | null
          skills_assessed: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          job_title: string
          status: string
          applied_date: string
          notes?: string | null
          resume_id?: string | null
          cover_letter_id?: string | null
          contact_id?: string | null
          created_at?: string
          updated_at?: string
          response_date?: string | null
          interview_date?: string | null
          offer_date?: string | null
          rejection_date?: string | null
          follow_up_dates?: string[] | null
          interview_feedback?: string | null
          salary_offered?: number | null
          application_method?: string | null
          application_source?: string | null
          interview_rounds?: number
          interview_types?: string[] | null
          skills_assessed?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          job_title?: string
          status?: string
          applied_date?: string
          notes?: string | null
          resume_id?: string | null
          cover_letter_id?: string | null
          contact_id?: string | null
          created_at?: string
          updated_at?: string
          response_date?: string | null
          interview_date?: string | null
          offer_date?: string | null
          rejection_date?: string | null
          follow_up_dates?: string[] | null
          interview_feedback?: string | null
          salary_offered?: number | null
          application_method?: string | null
          application_source?: string | null
          interview_rounds?: number
          interview_types?: string[] | null
          skills_assessed?: string[] | null
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          name: string
          content: Json
          job_title: string | null
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: Json
          job_title?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: Json
          job_title?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          title: string | null
          company: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          notes: string | null
          relationship_score: number | null
          last_contact_date: string | null
          next_followup_date: string | null
          communication_history: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          notes?: string | null
          relationship_score?: number | null
          last_contact_date?: string | null
          next_followup_date?: string | null
          communication_history?: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          notes?: string | null
          relationship_score?: number | null
          last_contact_date?: string | null
          next_followup_date?: string | null
          communication_history?: Json[]
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          skills: string[]
          resources: Json[]
          progress: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          skills?: string[]
          resources?: Json[]
          progress?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          skills?: string[]
          resources?: Json[]
          progress?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_histories: {
        Row: {
          id: string
          user_id: string
          messages: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      application_analytics: {
        Row: {
          user_id: string
          total_applications: number
          offers_received: number
          rejections: number
          in_interview_process: number
          avg_response_time_days: number | null
          avg_salary_offered: number | null
          avg_interview_rounds: number | null
          interview_rate: number
          offer_conversion_rate: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
