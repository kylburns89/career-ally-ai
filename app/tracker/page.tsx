import { createClient } from '../../lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PageContainer } from '../../components/page-container'
import { ApplicationTracker } from '../../components/applications/application-tracker'

export default async function TrackerPage() {
  const cookieStore = cookies()
  const supabase = createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    console.error('Session error:', sessionError)
    redirect('/auth/login')
  }

  // Get initial applications data
  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select("*, resumes(name), cover_letters(name), contacts(name, title)")
    .order("created_at", { ascending: false })

  if (applicationsError) {
    console.error('Error fetching applications:', applicationsError)
    throw applicationsError
  }

  // Get related data for dropdowns
  const [
    { data: resumes },
    { data: coverLetters },
    { data: contacts }
  ] = await Promise.all([
    supabase.from("resumes").select("id, name"),
    supabase.from("cover_letters").select("id, name"),
    supabase.from("contacts").select("id, name, title")
  ])

  return (
    <PageContainer>
      <ApplicationTracker 
        initialApplications={applications || []}
        initialResumes={resumes || []}
        initialCoverLetters={coverLetters || []}
        initialContacts={contacts || []}
      />
    </PageContainer>
  )
}
