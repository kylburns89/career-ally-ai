export interface CommunicationEntry {
  date: string
  type: 'email' | 'phone' | 'meeting' | 'linkedin' | 'other'
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  followup_needed: boolean
  notes?: string
}

export type JsonCommunicationEntry = {
  [K in keyof CommunicationEntry]: CommunicationEntry[K]
}

export interface Application {
  id: string
  userId: string
  jobTitle: string
  company: string
  location?: string | null
  status: string
  appliedDate: Date
  contactId?: string | null
  resumeId?: string | null
  coverLetterId?: string | null
  notes?: string | null
  nextSteps?: string | null
  communicationHistory?: JsonCommunicationEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface ApplicationFormState {
  id?: string
  jobTitle: string
  company: string
  location?: string
  status: "applied" | "interviewing" | "offer" | "rejected"
  appliedDate?: Date
  contactId?: string | null
  resumeId?: string | null
  coverLetterId?: string | null
  notes?: string
  nextSteps?: string
}
