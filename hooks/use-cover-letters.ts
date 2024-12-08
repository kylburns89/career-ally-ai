import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/database';

interface CoverLetter {
  id: string;
  name: string;
  content: string;
  job_title: string | null;
  company: string | null;
  created_at: string;
}

export function useCoverLetters() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoverLetters(data || []);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase
        .from('cover_letters')
        .insert([{
          user_id: session.user.id,
          name,
          content,
          job_title: jobTitle || null,
          company: company || null,
        }])
        .select()
        .single();

      if (error) throw error;

      setCoverLetters(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        title: 'Error',
        description: 'Failed to save cover letter',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteCoverLetter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete cover letter',
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
