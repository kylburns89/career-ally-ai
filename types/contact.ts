export interface CommunicationEntry {
  date: string
  type: 'email' | 'phone' | 'meeting' | 'linkedin' | 'other'
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  followup_needed: boolean
  notes?: string
}

// Convert CommunicationEntry to a type that matches Json
export type JsonCommunicationEntry = {
  [K in keyof CommunicationEntry]: CommunicationEntry[K]
}

export interface Contact {
  id: string
  user_id: string
  name: string
  company: string | null
  title: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  relationship_score: number | null
  last_contact_date: string | null
  next_followup_date: string | null
  notes: string | null
  communication_history: JsonCommunicationEntry[]
  created_at: string
  updated_at: string
}

export interface ContactStats {
  totalContacts: number
  averageRelationshipScore: number
  needsFollowup: number
  recentCommunications: number
  networkGrowth: {
    lastMonth: number
    lastQuarter: number
    lastYear: number
  }
}
