import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "../components/ui/use-toast";
import type { CoverLetter, CoverLetterTemplate } from '../types/cover-letter';

export function useCoverLetters() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchCoverLetters();
    } else {
      setCoverLetters([]);
    }
  }, [session]);

  const fetchCoverLetters = async () => {
    try {
      if (!session) {
        setCoverLetters([]);
        return;
      }

      const response = await fetch('/api/cover-letters');
      if (!response.ok) {
        throw new Error('Failed to fetch cover letters');
      }

      const data = await response.json();
      setCoverLetters(data);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch cover letters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCoverLetter = async (
    name: string,
    content: string,
    jobTitle?: string,
    company?: string,
    template: CoverLetterTemplate = 'professional'
  ) => {
    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name,
          content,
          jobTitle,
          company,
          template,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save cover letter');
      }

      const savedLetter = await response.json();

      // Update local state
      setCoverLetters(prev => [savedLetter, ...prev]);

      toast({
        title: 'Success',
        description: 'Cover letter saved successfully',
      });

      return savedLetter;
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

  const updateCoverLetter = async (
    id: string,
    name: string,
    content: string,
    jobTitle?: string,
    company?: string,
    template?: CoverLetterTemplate
  ) => {
    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name,
          content,
          jobTitle,
          company,
          template,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cover letter');
      }

      const updatedLetter = await response.json();

      // Update local state
      setCoverLetters(prev =>
        prev.map(letter =>
          letter.id === id ? updatedLetter : letter
        )
      );

      toast({
        title: 'Success',
        description: 'Cover letter updated successfully',
      });

      return updatedLetter;
    } catch (error) {
      console.error('Error updating cover letter:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update cover letter',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteCoverLetter = async (id: string) => {
    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cover letter');
      }

      // Update local state
      setCoverLetters(prev => prev.filter(letter => letter.id !== id));

      toast({
        title: 'Success',
        description: 'Cover letter deleted successfully',
      });

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
    saveCoverLetter,
    updateCoverLetter,
    deleteCoverLetter,
    refreshCoverLetters: fetchCoverLetters,
  };
}
