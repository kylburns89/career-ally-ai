'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

// Create supabase client outside component to prevent unnecessary re-creation
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state and set up listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        try {
          if (event === 'INITIAL_SESSION') {
            // Initial load - just set the session state
            if (currentSession) {
              const { data: { user: verifiedUser } } = await supabase.auth.getUser();
              setUser(verifiedUser);
              setSession(currentSession);
            }
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const { data: { user: verifiedUser } } = await supabase.auth.getUser();
            if (verifiedUser) {
              setUser(verifiedUser);
              setSession(currentSession);
              router.refresh();
            } else {
              throw new Error('No verified user found');
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            
            // Check if we're on a protected route
            const pathname = window.location.pathname;
            const isPublicRoute = ['/', '/about'].includes(pathname) || 
                                pathname.startsWith('/auth/') ||
                                pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/);
            
            // Only redirect if we're on a protected route
            if (!isPublicRoute) {
              const redirectUrl = new URL('/auth/login', window.location.href);
              redirectUrl.searchParams.set('redirectTo', pathname);
              router.push(redirectUrl.toString());
            }
            
            // Always refresh to update server state
            router.refresh();
          } else if (event === 'PASSWORD_RECOVERY') {
            // Handle password recovery flow
            router.push('/auth/reset-password');
          } else if (event === 'USER_UPDATED') {
            // Refresh the user data
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            if (updatedUser) {
              setUser(updatedUser);
              router.refresh();
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // Clear auth state
          setUser(null);
          setSession(null);
          await supabase.auth.signOut();
          
          // Check if we're on a protected route
          const pathname = window.location.pathname;
          const isPublicRoute = ['/', '/about'].includes(pathname) || 
                              pathname.startsWith('/auth/') ||
                              pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/);
          
          // Only redirect if we're on a protected route
          if (!isPublicRoute) {
            const redirectUrl = new URL('/auth/login', window.location.href);
            redirectUrl.searchParams.set('redirectTo', pathname);
            router.push(redirectUrl.toString());
          }
        } finally {
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
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
