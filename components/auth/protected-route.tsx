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
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  useEffect(() => {
    // Only handle profile checks since middleware handles auth
    if (user && !profile && !profileLoading && !isCheckingProfile) {
      setIsCheckingProfile(true)
      
      fetch('/api/profile')
        .then(response => {
          if (!response.ok && response.status === 404) {
            const currentPath = window.location.pathname
            const setupUrl = new URL('/settings/profile', window.location.origin)
            setupUrl.searchParams.set('redirectTo', currentPath)
            router.push(setupUrl.toString())
          }
        })
        .catch(() => {
          // If profile check fails, redirect to profile setup
          const currentPath = window.location.pathname
          const setupUrl = new URL('/settings/profile', window.location.origin)
          setupUrl.searchParams.set('redirectTo', currentPath)
          router.push(setupUrl.toString())
        })
        .finally(() => {
          setIsCheckingProfile(false)
        })
    }
  }, [user, profile, profileLoading, router, isCheckingProfile])

  // Show loading state while checking profile
  if (profileLoading || isCheckingProfile) {
    return <LoadingPage />
  }

  // Only render children if we have a profile
  if (profile) {
    return <>{children}</>
  }

  // Show loading while redirecting
  return <LoadingPage />
}
