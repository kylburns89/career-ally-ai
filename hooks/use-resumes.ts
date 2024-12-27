import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "../components/ui/use-toast";
import type { Resume, ResumeContent, Template } from '../types/resume';
import { normalizeTemplate, formToDbFormat } from '../types/resume';

export function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchResumes();
    } else {
      setResumes([]);
    }
  }, [session]);

  const fetchResumes = async () => {
    try {
      if (!session) {
        setResumes([]);
        return;
      }

      const response = await fetch('/api/resumes');
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();

      // Transform the data to match the Resume type
      const transformedResumes: Resume[] = data.map((resume: any) => {
        const dbContent = resume.content;
        const content: ResumeContent = {
          personalInfo: dbContent.personalInfo || { fullName: '', email: '', phone: '', location: '' },
          summary: dbContent.summary || '',
          experience: dbContent.experience || [],
          education: dbContent.education || [],
          skills: dbContent.skills || [],
          projects: dbContent.projects || [],
          certifications: dbContent.certifications || [],
          template: normalizeTemplate(resume.template),
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
          userId: resume.userId,
          name: resume.title,
          content,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
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

  const updateResume = async (id: string, name: string, content: ResumeContent) => {
    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      // Convert content to database format
      const dbContent = formToDbFormat(content);

      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name,
          content: dbContent,
          template: content.template,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const resume = await response.json();

      // Update local state
      setResumes(prev => prev.map(r => 
        r.id === id ? {
          ...r,
          name: resume.title,
          content: dbContent,
          updatedAt: resume.updatedAt,
        } : r
      ));

      toast({
        title: 'Success',
        description: 'Resume updated successfully',
      });

      return resume;
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update resume',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const uploadResume = async (file: File, name: string) => {
    try {
      setIsUploading(true);

      if (!session) {
        throw new Error('Please sign in to continue');
      }

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const { url } = await uploadResponse.json();

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

      // Create resume record
      const createResponse = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: name,
          content: dbContent,
          template: defaultTemplate,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create resume');
      }

      const resume = await createResponse.json();

      // Transform the new resume to match the Resume type
      const transformedResume: Resume = {
        id: resume.id,
        userId: resume.userId,
        name: resume.title,
        content: dbContent,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
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
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

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

  const createResume = async (data: { title: string; content: ResumeContent; template: Template }) => {
    try {
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create resume');
      }

      const resume = await response.json();

      // Transform the new resume to match the Resume type
      const transformedResume: Resume = {
        id: resume.id,
        userId: resume.userId,
        name: resume.title,
        content: data.content,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };

      // Update local state
      setResumes(prev => [transformedResume, ...prev]);

      toast({
        title: 'Success',
        description: 'Resume created successfully',
      });

      return transformedResume;
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create resume',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    resumes,
    isLoading,
    isUploading,
    uploadResume,
    updateResume,
    deleteResume,
    createResume,
    refreshResumes: fetchResumes,
  };
}
