"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const appearance = {
    elements: {
      rootBox: "mx-auto w-full max-w-md",
      card: "rounded-xl shadow-lg dark:shadow-slate-800",
      headerTitle: "text-2xl font-bold",
      headerSubtitle: "text-muted-foreground",
      socialButtonsBlockButton: "rounded-lg",
      formButtonPrimary: "rounded-lg bg-primary hover:bg-primary/90",
      footerActionLink: "text-primary hover:text-primary/90",
      formFieldInput: "rounded-lg border focus:ring-2 focus:ring-primary",
    },
    layout: {
      socialButtonsPlacement: "bottom",
      termsPageUrl: "/terms",
      privacyPageUrl: "/privacy",
    },
  };

  if (mode === "signin") {
    return (
      <SignIn
        appearance={appearance}
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    );
  }

  return (
    <SignUp
      appearance={appearance}
      redirectUrl="/dashboard"
      signInUrl="/sign-in"
    />
  );
}