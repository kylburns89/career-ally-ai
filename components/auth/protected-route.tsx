"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useProfile } from "../../hooks/use-profile"
import { LoadingPage } from "../loading"

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
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Store the current path for redirect after login
        const currentPath = window.location.pathname
        if (currentPath !== '/auth/login') {
          const redirectUrl = new URL('/auth/login', window.location.origin)
          redirectUrl.searchParams.set('redirectTo', currentPath)
          router.push(redirectUrl.toString())
        } else {
          router.push('/auth/login')
        }
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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
