import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      try {
        // Wait for auth state to be ready
        if (authLoading) {
          console.log('Waiting for auth state...')
          return
        }

        // Only proceed if we have a user
        if (!user) {
          console.log('No authenticated user')
          setProfile(null)
          setLoading(false)
          return
        }

        console.log('Authenticated user found:', user.id)

        // Get profile through API route
        console.log('Fetching profile from API for user:', user.id, '(attempt:', Date.now(), ')')
        const response = await fetch('/api/profile', {
          // Add credentials to ensure cookies are sent
          credentials: 'include',
          // Add cache control to prevent stale data
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        console.log('Profile API response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        if (response.ok) {
          // Profile exists, use it
          const profile = await response.json()
          console.log('Existing profile found:', profile)
          setProfile(profile)
          return
        }
        
        const responseText = await response.text()
        console.log('Profile API response text:', responseText)
        
        // Try to parse as JSON if possible for better error logging
        try {
          const json = JSON.parse(responseText)
          console.log('Profile API response parsed:', json)
        } catch (e) {
          // Not JSON, that's fine, we already logged the text
        }
        
        if (response.status !== 404) {
          // Unexpected error
          throw new Error(`Failed to fetch profile: ${responseText}`)
        }
        
        // Profile doesn't exist, create new one
        console.log('No profile found, creating new profile...')
        const createResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('Failed to create profile:', errorText)
          // Wait a bit and retry once
          await new Promise(resolve => setTimeout(resolve, 1000))
          const retryResponse = await fetch('/api/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!retryResponse.ok) {
            console.error('Failed to create profile after retry:', await retryResponse.text())
            throw new Error(`Failed to create profile: ${errorText}`)
          }
          
          const newProfile = await retryResponse.json()
          console.log('New profile created on retry:', newProfile)
          setProfile(newProfile)
        } else {
          const newProfile = await createResponse.json()
          console.log('New profile created:', newProfile)
          setProfile(newProfile)
        }
      } catch (error) {
        console.error('Profile error:', error)
        // Reset loading state but keep profile null to trigger protected route handling
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    // Run getProfile when auth state changes
    getProfile()
  }, [user, authLoading, router])

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log('Updating profile...')
      
      if (!user) {
        console.error('No authenticated user')
        throw new Error('No authenticated user')
      }

      console.log('Updating profile for user:', user.id)
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const responseText = await response.text()
      console.log('Update response:', {
        status: response.status,
        statusText: response.statusText,
        text: responseText
      })

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${responseText}`)
      }

      try {
        const updatedProfile = JSON.parse(responseText)
        console.log('Profile updated:', updatedProfile)
        setProfile(updatedProfile)
        return { profile: updatedProfile, error: null }
      } catch (e) {
        throw new Error('Invalid JSON in update response')
      }
    } catch (error) {
      console.error('Update error:', error)
      return { profile: null, error }
    }
  }

  return {
    profile,
    loading,
    updateProfile,
  }
}
