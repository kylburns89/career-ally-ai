'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, Sun, Moon, Briefcase, FileText, MessageSquare, Book, DollarSign, BarChart, GitFork, Search, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

const mainNavigation = [
  {
    name: 'Documents',
    items: [
      { name: 'Resume Builder & Analyzer', href: '/resume', icon: FileText },
      { name: 'Cover Letter Generator', href: '/cover-letter', icon: FileText },
    ]
  },
  {
    name: 'Career Growth',
    items: [
      { name: 'Job Search', href: '/jobs', icon: Search },
      { name: 'Interview Simulator', href: '/interview', icon: MessageSquare },
      { name: 'Technical Challenges', href: '/challenges', icon: Book },
      { name: 'Application Tracker', href: '/tracker', icon: Briefcase },
      { name: 'Contacts', href: '/applications/contacts', icon: Users },
      { name: 'Salary Coach', href: '/salary', icon: DollarSign },
      { name: 'Career Path Visualizer', href: '/tools/career', icon: GitFork },
      { name: 'Market Intelligence', href: '/market-intelligence', icon: BarChart },
    ]
  }
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <div className="flex flex-col space-y-4 py-4">
                {mainNavigation.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <h4 className="font-medium text-muted-foreground px-2">{group.name}</h4>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center px-2 py-1 text-sm font-medium rounded-md',
                            pathname === item.href ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Kareerly</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {mainNavigation.map((group) => (
                <NavigationMenuItem key={group.name}>
                  <NavigationMenuTrigger>{group.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={cn(
                                'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
                                pathname === item.href ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <div className="flex items-center">
                                <Icon className="mr-2 h-4 w-4" />
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link
                  href="/about"
                  className={cn(
                    'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                    pathname === '/about' ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  )}
                >
                  About
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side of navbar */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="mr-2"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Sign In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
