import { Application } from './application'

export interface Contact {
  id: string
  userId: string
  name: string
  company: string | null
  title: string | null
  email: string | null
  phone: string | null
  linkedinUrl: string | null
  relationship_score: number | null
  notes: string | null
  applications?: Application[] // Linked job applications
  createdAt: string
  updatedAt: string
}

export interface ContactStats {
  totalContacts: number
  averageRelationshipScore: number
  networkGrowth: {
    lastMonth: number
    lastQuarter: number
    lastYear: number
  }
}
