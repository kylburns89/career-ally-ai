"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useProfile } from "@/hooks/use-profile"
import { LoadingPage } from "@/components/loading"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { profile, loading } = useProfile()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [supabase, router])

  // Show loading state while checking auth and loading profile
  if (loading) {
    return <LoadingPage />
  }

  // If we have a profile, render the protected content
  if (profile) {
    return <>{children}</>
  }

  // This return is needed for TypeScript, but should never be shown
  // because we either show loading state or redirect to login
  return null
}
