"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../hooks/use-auth"
import { useProfile } from "../../hooks/use-profile"
import { LoadingPage } from "../loading"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  useEffect(() => {
    // Handle authentication redirects
    if (!authLoading && !user) {
      const currentPath = window.location.pathname
      if (currentPath !== '/auth/login') {
        const redirectUrl = new URL('/auth/login', window.location.origin)
        redirectUrl.searchParams.set('redirectTo', currentPath)
        router.push(redirectUrl.toString())
        return
      }
    }

    // Handle profile check and redirect
    if (user && !profile && !profileLoading && !isCheckingProfile) {
      setIsCheckingProfile(true)
      
      fetch('/api/profile')
        .then(response => {
          if (!response.ok && response.status === 404) {
            router.push('/settings/profile')
          }
        })
        .catch(() => {
          // If profile check fails, assume we need to create one
          router.push('/settings/profile')
        })
        .finally(() => {
          setIsCheckingProfile(false)
        })
    }
  }, [user, authLoading, profile, profileLoading, router, isCheckingProfile])

  // Show loading state while checking auth, profile, or during profile verification
  if (authLoading || profileLoading || isCheckingProfile) {
    return <LoadingPage />
  }

  // Only render children if we have both user and profile
  if (user && profile) {
    return <>{children}</>
  }

  // Show loading while redirecting
  return <LoadingPage />
}
