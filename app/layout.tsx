import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
import { Navbar } from '../components/navbar';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Kareerly - Your AI-powered Career Development Platform',
  description: 'Accelerate your career growth with AI-powered resume building, interview preparation, and personalized career guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen flex flex-col">
            <header className="sticky top-0 z-50">
              <Navbar />
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="w-full border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-sm leading-loose text-center text-muted-foreground md:text-left">
                  Built with AI to empower your career journey. © 2024 Kareerly
                </p>
              </div>
            </footer>
          </div>
          <Toaster richColors closeButton position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
