"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up to start your career journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={loading}
            >
              Sign up with Google
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.push("/auth/signin")}
              >
                Sign in
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
