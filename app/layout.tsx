import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { Navbar } from "../components/navbar";
import { Toaster } from "../components/ui/toaster";
import { NextAuthProvider } from "../components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kareerly",
  description: "Your AI-powered career companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Toaster />
            </div>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
