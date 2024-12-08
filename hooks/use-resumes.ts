import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Resume, ResumeContent } from '@/types/resume';

export function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch resumes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file: File, name: string) => {
    try {
      setIsUploading(true);

      // Upload file to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { url } = await response.json();

      // Create resume record in database
      const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .insert([
          {
            name,
            file_url: url,
            content: {}, // Initialize with empty content
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setResumes((prev) => [resume, ...prev]);

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully',
      });

      return resume;
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload resume',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const resume = resumes.find((r) => r.id === id);
      if (!resume) return;

      // Delete file from storage if it exists
      if (resume.file_url) {
        const fileName = resume.file_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('resumes')
            .remove([fileName]);

          if (storageError) throw storageError;
        }
      }

      // Delete record from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update local state
      setResumes((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: 'Success',
        description: 'Resume deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resume',
        variant: 'destructive',
      });
    }
  };

  return {
    resumes,
    isLoading,
    isUploading,
    uploadResume,
    deleteResume,
    refreshResumes: fetchResumes,
  };
}
