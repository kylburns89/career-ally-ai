"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "../components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenuIndicator,
} from "../components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const MobileNav = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-3 border-b pb-4">
        <h2 className="px-2 text-sm font-semibold text-foreground/80">Documents</h2>
        <Link href="/resume" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/resume") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">📄</span>
          Resume
        </Link>
        <Link href="/cover-letter" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/cover-letter") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">📄</span>
          Cover Letter
        </Link>
      </div>
      
      <div className="flex flex-col space-y-3 border-b pb-4">
        <h2 className="px-2 text-sm font-semibold text-foreground/80">Job Search</h2>
        <Link href="/jobs" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/jobs") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">🔍</span>
          Job Search
        </Link>
        <Link href="/applications" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/applications") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">💼</span>
          Application Tracker
        </Link>
        <Link href="/contacts" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/contacts") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">👥</span>
          Contacts
        </Link>
      </div>

      <div className="flex flex-col space-y-3 border-b pb-4">
        <h2 className="px-2 text-sm font-semibold text-foreground/80">Career Growth</h2>
        <Link href="/market-intelligence" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/market-intelligence") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">📊</span>
          Market Intelligence
        </Link>
        <Link href="/salary" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/salary") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">💰</span>
          Salary Coach
        </Link>
        <Link href="/learning" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/learning") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">📚</span>
          Learning Path
        </Link>
      </div>

      <div className="flex flex-col space-y-3 border-b pb-4">
        <h2 className="px-2 text-sm font-semibold text-foreground/80">Practice</h2>
        <Link href="/interview" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/interview") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">💬</span>
          Interview Simulator
        </Link>
        <Link href="/challenges" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/challenges") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">🎯</span>
          Technical Challenges
        </Link>
      </div>

      <div className="flex flex-col space-y-3">
        <Link href="/chat" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/chat") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">💬</span>
          AI Chat
        </Link>
        <Link href="/about" className={`flex items-center gap-2 text-sm rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/about") ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <span className="text-sm">ℹ️</span>
          About
        </Link>
      </div>
    </div>
  );
};

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-violet11">
              Kareerly
            </Link>
            {session && (
              <NavigationMenu className="hidden md:block">
                <NavigationMenuList className="flex items-center gap-2 bg-transparent shadow-none">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Documents</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="one m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/resume"
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple9 to-indigo9 p-[25px] no-underline outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[7px] mt-4 text-[18px] font-medium leading-[1.2] text-white">
                                Resume Builder
                              </div>
                              <p className="text-[14px] leading-[1.3] text-mauve4">
                                Build and manage your professional resume with AI assistance.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/cover-letter"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Cover Letter Generator
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Create tailored cover letters with AI assistance.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">Job Search</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[600px] sm:grid-flow-col sm:grid-rows-3">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/jobs"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Job Search
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Find your next opportunity with AI-powered job matching.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/applications"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Application Tracker
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Track and manage your job applications efficiently.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/contacts"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Contacts
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Build and manage your professional network.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">Career Growth</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[600px] sm:grid-flow-col sm:grid-rows-3">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/market-intelligence"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Market Intelligence
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Stay informed about industry trends and insights.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/salary"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Salary Coach
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Get salary insights and negotiation strategies.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/learning"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Learning Path
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Curated learning paths for different career goals.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">Practice</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[600px] sm:grid-flow-col sm:grid-rows-2">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/interview"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Interview Simulator
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Practice interviewing with AI-powered feedback.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/challenges"
                              className="block select-none rounded-md p-3 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                            >
                              <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
                                Technical Challenges
                              </div>
                              <p className="leading-[1.4] text-mauve11">
                                Practice coding problems with real-time feedback.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/chat"
                          className="inline-flex select-none items-center justify-center rounded px-3 py-2 text-[15px] font-medium leading-none text-violet11 no-underline outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                      >
                        AI Chat
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/about"
                        className="inline-flex select-none items-center rounded px-3 py-2 text-[15px] font-medium leading-none text-violet11 no-underline outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
                      >
                        About
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
                <NavigationMenuViewport />
              </NavigationMenu>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {session && (
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <span className="text-lg">☰</span>
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur" />
                  <Dialog.Content className="fixed inset-y-0 left-0 z-50 h-full w-[300px] border-r bg-background shadow-lg animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200 sm:w-[400px]">
                    <div className="flex flex-col gap-4 h-full overflow-hidden p-6">
                      <Link href="/" className="text-lg font-semibold text-primary">
                        Kareerly
                      </Link>
                      <div className="overflow-y-auto scrollbar-custom">
                        <MobileNav />
                      </div>
                    </div>
                    <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <span className="text-lg">✕</span>
                      <span className="sr-only">Close</span>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )}
            {/* Theme toggle with mounted check */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2 w-9 px-0"
            >
              {mounted ? (
                <span className="text-lg">
                  {theme === "dark" ? "☀️" : "🌙"}
                </span>
              ) : (
                <span className="w-4 h-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>
                        {session.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session.user?.name || 'Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
