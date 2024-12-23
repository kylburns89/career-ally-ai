'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session refresh error:', sessionError);
        return;
      }
      
      if (currentSession) {
        // Update session even if user fetch fails
        setSession(currentSession);
        
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('User fetch error:', userError);
          // Keep existing user data if fetch fails
          return;
        }
        
        setUser(currentUser);
      } else {
        // No session - clear both
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      // Only clear on critical errors
      if (error instanceof Error && error.message.includes('fatal')) {
        setSession(null);
        setUser(null);
      }
    }
  }, [supabase.auth]);

  // Set up periodic session refresh
  useEffect(() => {
    const interval = setInterval(refreshSession, 10 * 60 * 1000); // every 10 minutes
    return () => clearInterval(interval);
  }, [refreshSession]);

  useEffect(() => {
    let mounted = true;

    // Check for initial session immediately
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            setSession(session);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!userError && user) {
              setUser(user);
            }
          } else {
            setSession(null);
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Initialize auth state and set up listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        try {
          if (!mounted) return;

          switch (event) {
            case 'INITIAL_SESSION':
              // Initial session is handled by initializeAuth
              break;
              
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
            case 'USER_UPDATED':
              await refreshSession();
              router.refresh();
              break;
              
            case 'SIGNED_OUT':
              setUser(null);
              setSession(null);
              router.refresh();
              break;
              
            case 'PASSWORD_RECOVERY':
              router.push('/auth/reset-password');
              break;
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          
          if (mounted) {
            // Only clear state and redirect on critical errors
            if (error instanceof Error && error.message.includes('fatal')) {
              setUser(null);
              setSession(null);
              
              const pathname = window.location.pathname;
              const isPublicRoute = ['/', '/about'].includes(pathname) || 
                                  pathname.startsWith('/auth/') ||
                                  pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/);
              
              if (!isPublicRoute) {
                const redirectUrl = new URL('/auth/login', window.location.href);
                redirectUrl.searchParams.set('redirectTo', pathname);
                router.push(redirectUrl.toString());
              }
            }
          }
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
