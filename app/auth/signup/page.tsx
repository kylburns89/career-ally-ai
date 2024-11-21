"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useToast } from "../../../components/ui/use-toast"
import { LoadingSpinner } from "../../../components/loading"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Starting signup process for email:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Signup error:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log('Signup successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        confirmationSent: data.user?.confirmation_sent_at
      })

      toast({
        title: "Success",
        description: "Check your email to confirm your account",
      })
      
      // Redirect to login page
      router.push("/auth/login")
    } catch (error) {
      console.error('Unexpected signup error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignUp = async () => {
    try {
      setGithubLoading(true)
      console.log('Starting GitHub signup process')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('GitHub signup error:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('GitHub signup initiated successfully')
      }
    } catch (error) {
      console.error('Unexpected GitHub signup error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setGithubLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to get started with Kareerly
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignUp}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={loading || githubLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              disabled={loading || githubLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || githubLoading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Creating account...</span>
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubSignUp}
            disabled={loading || githubLoading}
          >
            {githubLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Connecting to GitHub...</span>
              </>
            ) : (
              "Continue with GitHub"
            )}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
