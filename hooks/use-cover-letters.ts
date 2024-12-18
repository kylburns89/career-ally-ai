import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { Database } from '../types/database';
import { CoverLetter } from '../types/cover-letter';

export function useCoverLetters() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchCoverLetters();
      } else {
        setCoverLetters([]);
      }
    });

    // Initial fetch
    fetchCoverLetters();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCoverLetters = async () => {
    try {
      // First check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setCoverLetters([]);
        return;
      }

      // Then verify the user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setCoverLetters([]);
        return;
      }

      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert the fetched data to match CoverLetter type
      const typedCoverLetters: CoverLetter[] = (data || []).map(letter => ({
        ...letter,
        content: typeof letter.content === 'string' 
          ? letter.content 
          : JSON.stringify(letter.content)
      }));
      
      setCoverLetters(typedCoverLetters);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cover letters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCoverLetter = async (name: string, content: string, jobTitle?: string, company?: string) => {
    try {
      // First check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please sign in to continue');
      }

      // Then verify the user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in to continue');
      }

      // Parse content as JSON if it's a stringified JSON, otherwise store as is
      let jsonContent;
      try {
        jsonContent = JSON.parse(content);
      } catch {
        jsonContent = content;
      }

      const { data, error } = await supabase
        .from('cover_letters')
        .insert([{
          user_id: user.id,
          name,
          content: jsonContent,
          job_title: jobTitle || null,
          company: company || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to match CoverLetter type
      const typedCoverLetter: CoverLetter = {
        ...data,
        content: typeof data.content === 'string' 
          ? data.content 
          : JSON.stringify(data.content)
      };

      setCoverLetters(prev => [typedCoverLetter, ...prev]);
      return typedCoverLetter;
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save cover letter',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteCoverLetter = async (id: string) => {
    try {
      // First check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please sign in to continue');
      }

      // Then verify the user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in to continue');
      }

      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete cover letter',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    coverLetters,
    isLoading,
    refreshCoverLetters: fetchCoverLetters,
    saveCoverLetter,
    deleteCoverLetter,
  };
}
