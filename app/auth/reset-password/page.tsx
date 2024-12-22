"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading";
import Link from "next/link";
import { resetPassword } from "../actions";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if ('error' in result) {
        throw new Error(result.error);
      }
      setSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a password reset link. Please check your email to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link 
              href="/auth/login" 
              className="text-primary hover:underline font-medium w-full text-center"
            >
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
            <Link 
              href="/auth/login" 
              className="text-primary hover:underline font-medium text-center"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
