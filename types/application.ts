export interface Application {
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

// Type for the Supabase query response
export type ApplicationResponse = Application & {
  resumes: { name: string } | null
  cover_letters: { name: string } | null
  contacts: { name: string; title: string | null } | null
}

// Type for the form state
export interface ApplicationFormState {
  id?: string
  company: string
  job_title: string
  status: "applied" | "interviewing" | "offer" | "rejected"
  notes: string
  resume_id: string | null
  cover_letter_id: string | null
  contact_id: string | null
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

// Type for analytics data
export interface ApplicationAnalytics {
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
