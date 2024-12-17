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
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get session first
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          // If we have a session, verify the user
          const { data: { user: verifiedUser } } = await supabase.auth.getUser();
          setUser(verifiedUser);
          setSession(initialSession);
        } else {
          // No session, clear state
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
      
      if (event === 'SIGNED_IN') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        // Force a router refresh to update server state
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        // Clear any cached data and refresh
        router.refresh();
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        // Verify user is still valid
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        setUser(verifiedUser);
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
