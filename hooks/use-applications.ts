import { useCallback, useState } from 'react'
import { Application, CommunicationEntry, JsonCommunicationEntry } from '../types/application'
import { toast } from '../components/ui/use-toast'

export function useApplications(initialApplications: Application[] = []) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [isLoading, setIsLoading] = useState(false)

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({ title: 'Failed to fetch applications', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addCommunication = async (
    applicationId: string,
    entry: Omit<CommunicationEntry, 'date'>
  ) => {
    try {
      const application = applications.find(a => a.id === applicationId)
      if (!application) return null

      const newEntry: JsonCommunicationEntry = {
        ...entry,
        date: new Date().toISOString()
      }

      const response = await fetch(`/api/applications/${applicationId}/communication`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      })

      if (!response.ok) throw new Error('Failed to add communication')
      
      const data = await response.json()
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? data : app
      ))
      return data
    } catch (error) {
      console.error('Error adding communication:', error)
      toast({ title: 'Failed to add communication', variant: 'destructive' })
      return null
    }
  }

  const fetchApplicationById = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`)
      if (!response.ok) throw new Error('Failed to fetch application')
      return await response.json()
    } catch (error) {
      console.error('Error fetching application:', error)
      toast({ title: 'Failed to fetch application', variant: 'destructive' })
      return null
    }
  }

  const updateApplication = useCallback((updatedApplication: Application) => {
    setApplications(prev => prev.map(app => 
      app.id === updatedApplication.id ? updatedApplication : app
    ))
  }, [])

  const deleteApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId))
  }, [])

  const deleteCommunication = async (applicationId: string, communicationIndex: number) => {
    try {
      const application = applications.find(a => a.id === applicationId)
      if (!application) return null

      const response = await fetch(`/api/applications/${applicationId}/communication`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: communicationIndex })
      })

      if (!response.ok) throw new Error('Failed to delete communication')
      
      const data = await response.json()
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? data : app
      ))
      return data
    } catch (error) {
      console.error('Error deleting communication:', error)
      toast({ title: 'Failed to delete communication', variant: 'destructive' })
      return null
    }
  }

  return {
    applications,
    setApplications,
    isLoading,
    fetchApplications,
    addCommunication,
    deleteCommunication,
    fetchApplicationById,
    updateApplication,
    deleteApplication
  }
}
