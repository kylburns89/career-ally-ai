import { SignUp } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <SignUp
        appearance={{
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
        }}
      />
    </div>
  );
}