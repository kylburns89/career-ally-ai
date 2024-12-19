import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { Database } from '../types/database'
import { createClient } from '../lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

        // Get profile directly from Supabase
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }

        if (existingProfile) {
          console.log('Existing profile found:', existingProfile)
          setProfile(existingProfile)
          return
        }

        // Profile doesn't exist, create new one
        console.log('No profile found, creating new profile...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            title: null,
            bio: null,
            location: null,
            years_experience: null,
            skills: [],
            industries: [],
            education: [],
            experience: [],
            certifications: [],
            desired_salary: null,
            desired_location: null,
            remote_only: false,
            linkedin: null,
            github: null,
            portfolio: null,
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          throw createError
        }

        console.log('New profile created:', newProfile)
        setProfile(newProfile)
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
  }, [user, authLoading, router, supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log('Updating profile...')
      
      if (!user) {
        console.error('No authenticated user')
        throw new Error('No authenticated user')
      }

      console.log('Updating profile for user:', user.id)
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Profile updated:', updatedProfile)
      setProfile(updatedProfile)
      return { profile: updatedProfile, error: null }
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
