import { useCallback, useEffect, useState } from 'react'
import { Contact, ContactStats } from '../types/contact'
import { Application } from '../types/application'
import { useSession } from 'next-auth/react'
import { toast } from '../components/ui/use-toast'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({
    totalContacts: 0,
    averageRelationshipScore: 0,
    networkGrowth: {
      lastMonth: 0,
      lastQuarter: 0,
      lastYear: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const fetchContacts = useCallback(async () => {
    try {
      if (!session?.user?.email) {
        setContacts([])
        setStats({
          totalContacts: 0,
          averageRelationshipScore: 0,
          networkGrowth: {
            lastMonth: 0,
            lastQuarter: 0,
            lastYear: 0
          }
        })
        return
      }

      const response = await fetch('/api/contacts')
      if (!response.ok) throw new Error('Failed to fetch contacts')
      const data = await response.json()

      setContacts(data)
      
      // Calculate stats
      const now = new Date()
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
      const oneQuarterAgo = new Date(now.setMonth(now.getMonth() - 3))
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1))

      const stats: ContactStats = {
        totalContacts: data.length,
        averageRelationshipScore: data.reduce((acc: number, contact: Contact) => 
          acc + (contact.relationship_score || 0), 0) / data.length || 0,
        networkGrowth: {
          lastMonth: data.filter((contact: Contact) => 
            new Date(contact.createdAt) >= oneMonthAgo
          ).length,
          lastQuarter: data.filter((contact: Contact) =>
            new Date(contact.createdAt) >= oneQuarterAgo
          ).length,
          lastYear: data.filter((contact: Contact) =>
            new Date(contact.createdAt) >= oneYearAgo
          ).length
        }
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({ title: 'Failed to fetch contacts', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const addContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'applications'>) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })

      if (!response.ok) throw new Error('Failed to add contact')
      
      const data = await response.json()
      await fetchContacts()
      return data
    } catch (error) {
      console.error('Error adding contact:', error)
      toast({ title: 'Failed to add contact', variant: 'destructive' })
      return null
    }
  }

  const updateContact = async (
    id: string, 
    updates: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'applications'>>
  ) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update contact')
      
      const data = await response.json()
      await fetchContacts()
      return data
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({ title: 'Failed to update contact', variant: 'destructive' })
      return null
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete contact')
      
      await fetchContacts()
      return true
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({ title: 'Failed to delete contact', variant: 'destructive' })
      return false
    }
  }

  const linkApplication = async (contactId: string, applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId })
      })

      if (!response.ok) throw new Error('Failed to link application')
      
      await fetchContacts()
      return true
    } catch (error) {
      console.error('Error linking application:', error)
      toast({ title: 'Failed to link application', variant: 'destructive' })
      return false
    }
  }

  const unlinkApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: null })
      })

      if (!response.ok) throw new Error('Failed to unlink application')
      
      await fetchContacts()
      return true
    } catch (error) {
      console.error('Error unlinking application:', error)
      toast({ title: 'Failed to unlink application', variant: 'destructive' })
      return false
    }
  }

  return {
    contacts,
    stats,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    linkApplication,
    unlinkApplication,
    refresh: fetchContacts
  }
}
