import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Contact, ContactStats, CommunicationEntry, JsonCommunicationEntry } from '../types/contact'
import { Database } from '../types/database'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({
    totalContacts: 0,
    averageRelationshipScore: 0,
    needsFollowup: 0,
    recentCommunications: 0,
    networkGrowth: {
      lastMonth: 0,
      lastQuarter: 0,
      lastYear: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  const fetchContacts = useCallback(async () => {
    setIsLoading(true)
    const { data: fetchedContacts, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching contacts:', error)
      setIsLoading(false)
      return
    }

    // Convert the fetched contacts to ensure type safety
    const typedContacts: Contact[] = fetchedContacts.map(contact => ({
      ...contact,
      communication_history: (contact.communication_history || []) as JsonCommunicationEntry[]
    }))

    setContacts(typedContacts)
    
    // Calculate stats
    const now = new Date()
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
    const oneQuarterAgo = new Date(now.setMonth(now.getMonth() - 3))
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1))

    const stats: ContactStats = {
      totalContacts: typedContacts.length,
      averageRelationshipScore: typedContacts.reduce((acc, contact) => 
        acc + (contact.relationship_score || 0), 0) / typedContacts.length || 0,
      needsFollowup: typedContacts.filter(contact => 
        contact.next_followup_date && new Date(contact.next_followup_date) <= new Date()
      ).length,
      recentCommunications: typedContacts.filter(contact =>
        contact.last_contact_date && new Date(contact.last_contact_date) >= oneMonthAgo
      ).length,
      networkGrowth: {
        lastMonth: typedContacts.filter(contact => 
          new Date(contact.created_at) >= oneMonthAgo
        ).length,
        lastQuarter: typedContacts.filter(contact =>
          new Date(contact.created_at) >= oneQuarterAgo
        ).length,
        lastYear: typedContacts.filter(contact =>
          new Date(contact.created_at) >= oneYearAgo
        ).length
      }
    }

    setStats(stats)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const addContact = async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'communication_history'>) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('No session found:', sessionError)
      return null
    }

    const newContact = {
      ...contactData,
      user_id: session.user.id,
      communication_history: []
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([newContact])
      .select()
      .single()

    if (error) {
      console.error('Error adding contact:', error)
      return null
    }

    await fetchContacts()
    return data
  }

  const updateContact = async (
    id: string, 
    updates: Partial<Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    // Convert communication_history to JsonCommunicationEntry[] if it exists
    const updatesWithJsonHistory = updates.communication_history 
      ? {
          ...updates,
          communication_history: updates.communication_history as JsonCommunicationEntry[]
        }
      : updates

    const { data, error } = await supabase
      .from('contacts')
      .update(updatesWithJsonHistory)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact:', error)
      return null
    }

    await fetchContacts()
    return data
  }

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact:', error)
      return false
    }

    await fetchContacts()
    return true
  }

  const addCommunication = async (
    contactId: string, 
    entry: Omit<CommunicationEntry, 'date'>
  ) => {
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return null

    const newEntry: JsonCommunicationEntry = {
      ...entry,
      date: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({
        communication_history: [...(contact.communication_history || []), newEntry],
        last_contact_date: new Date().toISOString()
      })
      .eq('id', contactId)
      .select()
      .single()

    if (error) {
      console.error('Error adding communication:', error)
      return null
    }

    await fetchContacts()
    return data
  }

  return {
    contacts,
    stats,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    addCommunication,
    refresh: fetchContacts
  }
}
