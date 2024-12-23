"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification link to complete your registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>Click the link in the email to verify your account.</p>
          <p>If you don&apos;t see the email, check your spam folder.</p>
        </div>
        <div className="flex flex-col space-y-2">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="ghost" className="w-full">
              Use a different email
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
