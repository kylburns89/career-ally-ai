import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          console.log('Setting initial user:', session?.user?.id);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, userId: session?.user?.id });
      if (mounted) {
        setUser(session?.user ?? null);
        // Don't set loading false here as it might cause flicker
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Clear any auth state
      setUser(null);
      // Redirect to landing page
      router.push('/');
      // Force a page refresh to clear any cached data
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug log whenever user or loading state changes
  useEffect(() => {
    console.log('Auth state updated:', { userId: user?.id, loading });
  }, [user, loading]);

  return {
    user,
    loading,
    signOut,
  };
}
