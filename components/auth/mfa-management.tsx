'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { listFactors } from '@/lib/auth'
import { unenrollMFA } from '@/app/auth/actions'
import type { FactorList } from '@/types/auth'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export function MFAManagement() {
  const [factors, setFactors] = useState<FactorList>({ totp: [], phone: [] })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFactors()
  }, [])

  const loadFactors = async () => {
    try {
      const data = await listFactors()
      setFactors(data)
    } catch (err) {
      setError('Failed to load MFA factors')
      console.error('Error loading factors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (factorId: string) => {
    try {
      const result = await unenrollMFA(factorId)
      if ('error' in result) throw new Error(result.error)
      await loadFactors() // Refresh the list
    } catch (err: any) {
      setError('Failed to remove factor')
      console.error('Error removing factor:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {factors.totp.length === 0 && factors.phone.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-600">No authentication factors are currently set up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {factors.totp.map((factor) => (
            <Card key={factor.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Authenticator App</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Added on {new Date(factor.created_at).toLocaleDateString()}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Two-Factor Authentication?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disable two-factor authentication for your account. 
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUnenroll(factor.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
          
          {factors.phone.map((factor) => (
            <Card key={factor.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Phone Number</h3>
                  </div>
                  {factor.phone && (
                    <p className="text-sm text-gray-600 mt-1">{factor.phone}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Added on {new Date(factor.created_at).toLocaleDateString()}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Phone Authentication?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disable phone-based two-factor authentication for your account. 
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUnenroll(factor.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
