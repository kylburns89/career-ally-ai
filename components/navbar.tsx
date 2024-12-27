"use client";

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

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">
              Kareerly
            </Link>
            {session && (
              <div className="hidden md:flex items-center gap-6">
                <NavigationMenu>
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">Documents</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] grid-cols-2 gap-3 p-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/resume"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/resume") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">📄</span>
                                <div>
                                  <div className="font-medium mb-1">Resume</div>
                                  <div className="text-xs text-muted-foreground">Build and manage your resume</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/cover-letter"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/cover-letter") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">📄</span>
                                <div>
                                  <div className="font-medium mb-1">Cover Letter</div>
                                  <div className="text-xs text-muted-foreground">Create tailored cover letters</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">Job Search</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] grid-cols-2 gap-3 p-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/jobs"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/jobs") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">🔍</span>
                                <div>
                                  <div className="font-medium mb-1">Job Search</div>
                                  <div className="text-xs text-muted-foreground">Find your next opportunity</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/applications"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/applications") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">💼</span>
                                <div>
                                  <div className="font-medium mb-1">Application Tracker</div>
                                  <div className="text-xs text-muted-foreground">Track your job applications</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/contacts"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/contacts") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">👥</span>
                                <div>
                                  <div className="font-medium mb-1">Contacts</div>
                                  <div className="text-xs text-muted-foreground">Manage your network</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">Career Growth</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] grid-cols-2 gap-3 p-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/market-intelligence"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/market-intelligence") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">📊</span>
                                <div>
                                  <div className="font-medium mb-1">Market Intelligence</div>
                                  <div className="text-xs text-muted-foreground">Industry insights and trends</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/salary"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/salary") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">💰</span>
                                <div>
                                  <div className="font-medium mb-1">Salary Coach</div>
                                  <div className="text-xs text-muted-foreground">Negotiate better compensation</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/learning"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/learning") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">📚</span>
                                <div>
                                  <div className="font-medium mb-1">Learning Path</div>
                                  <div className="text-xs text-muted-foreground">Grow your skills</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">Practice</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] grid-cols-2 gap-3 p-4">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/interview"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/interview") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">💬</span>
                                <div>
                                  <div className="font-medium mb-1">Interview Simulator</div>
                                  <div className="text-xs text-muted-foreground">Practice interviewing</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/challenges"
                                className={`flex items-center gap-2 select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                  isActive("/challenges") ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-sm">🎯</span>
                                <div>
                                  <div className="font-medium mb-1">Technical Challenges</div>
                                  <div className="text-xs text-muted-foreground">Practice coding problems</div>
                                </div>
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
                          className={`flex items-center gap-2 select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                            isActive("/chat") ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-sm">💬</span>
                          <span>AI Chat</span>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/about"
                          className={`flex items-center gap-2 select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                            isActive("/about") ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-sm">ℹ️</span>
                          <span>About</span>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2"
            >
              {theme === "dark" ? (
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
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
