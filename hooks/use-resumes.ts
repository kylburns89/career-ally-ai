import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Resume, ResumeContent, Template } from '@/types/resume';
import { normalizeTemplate } from '@/types/resume';
import type { Database } from '@/types/database';

export function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Resume type
      const transformedResumes: Resume[] = (data || []).map(resume => {
        const dbContent = resume.content as any;
        const content: ResumeContent = {
          personalInfo: dbContent.personalInfo || { fullName: '', email: '', phone: '', location: '' },
          summary: dbContent.summary || '',
          experience: dbContent.experience || [],
          education: dbContent.education || [],
          skills: dbContent.skills || [],
          projects: dbContent.projects || [],
          certifications: dbContent.certifications || [],
          template: normalizeTemplate(dbContent.template),
          sections: dbContent.sections || [
            "summary",
            "experience",
            "education",
            "skills",
            "projects",
            "certifications",
          ],
        };

        return {
          id: resume.id,
          userId: resume.user_id,
          name: resume.name,
          content,
          createdAt: resume.created_at,
          updatedAt: resume.updated_at,
          file_url: dbContent.file_url,
        };
      });

      setResumes(transformedResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch resumes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file: File, name: string) => {
    try {
      setIsUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Upload file to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const { url } = await response.json();

      const defaultTemplate: Template = 'professional';
      const dbContent = {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        template: defaultTemplate,
        sections: [
          "summary",
          "experience",
          "education",
          "skills",
          "projects",
          "certifications",
        ],
        file_url: url,
      };

      // Create resume record in database
      const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: session.user.id,
          name,
          content: dbContent,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Transform the new resume to match the Resume type
      const transformedResume: Resume = {
        id: resume.id,
        userId: resume.user_id,
        name: resume.name,
        content: {
          personalInfo: dbContent.personalInfo,
          summary: dbContent.summary,
          experience: dbContent.experience,
          education: dbContent.education,
          skills: dbContent.skills,
          projects: dbContent.projects,
          certifications: dbContent.certifications,
          template: defaultTemplate,
          sections: dbContent.sections,
        },
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
        file_url: url,
      };

      // Update local state
      setResumes(prev => [transformedResume, ...prev]);

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully',
      });

      return transformedResume;
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const resume = resumes.find((r) => r.id === id);
      if (!resume) return;

      // Delete file from storage if it exists
      if (resume.file_url) {
        const fileName = resume.file_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('resumes')
            .remove([`${session.user.id}/${fileName}`]);

          if (storageError) throw storageError;
        }
      }

      // Delete record from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

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
        description: error instanceof Error ? error.message : 'Failed to delete resume',
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
