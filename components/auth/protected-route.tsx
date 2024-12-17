"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { LoadingPage } from "../loading"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  useEffect(() => {
    if (!authLoading && !user) {
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
  }, [user, authLoading, router])

  // Show loading state while checking auth and loading profile
  if (authLoading || profileLoading) {
    return <LoadingPage />
  }

  // If we have both a user and profile, render the protected content
  if (user && profile) {
    return <>{children}</>
  }

  // This return is needed for TypeScript, but should never be shown
  // because we either show loading state or redirect to login
  return null
}
