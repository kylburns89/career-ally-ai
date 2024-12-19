import { createClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { PageContainer } from '../../../components/page-container'
import { LoadingPage } from '../../../components/loading'

// Client components
import ProfileForm from './profile-form'

export default async function ProfileSettings() {
  const cookieStore = cookies()
  const supabase = createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    console.error('Session error:', sessionError)
    redirect('/auth/login')
  }

  // Get initial profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('id', session.user.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError)
    throw profileError
  }

  // If no profile exists, create one
  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
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
      console.error('Error creating profile:', createError)
      throw createError
    }

    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
          <ProfileForm initialData={newProfile} />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <ProfileForm initialData={profile} />
      </div>
    </PageContainer>
  )
}
