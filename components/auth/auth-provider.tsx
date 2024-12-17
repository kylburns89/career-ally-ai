'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // First get the session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          // IMPORTANT: Always verify the user with getUser()
          // This ensures the token is valid by checking with the Supabase Auth server
          const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error verifying user:', userError);
            // Clear invalid session state
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
          } else if (verifiedUser) {
            // User is verified, set the state
            setUser(verifiedUser);
            setSession(initialSession);
          } else {
            // No verified user found
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
          }
        } else {
          // No session found
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // On error, clear state
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          // Always verify the user with getUser() on auth state changes
          const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error verifying user:', userError);
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
            router.push('/auth/login');
          } else if (verifiedUser) {
            setUser(verifiedUser);
            setSession(currentSession);
            // Force a router refresh to update server state
            router.refresh();
          } else {
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Error handling auth change:', error);
          setUser(null);
          setSession(null);
          await supabase.auth.signOut();
          router.push('/auth/login');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        // Clear any cached data and refresh
        router.refresh();
        router.push('/auth/login');
      }
      
      setLoading(false);
    });

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
