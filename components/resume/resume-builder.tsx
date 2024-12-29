"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import Image from 'next/image';
import ResumeTemplates from "./resume-templates";
import { ResumeHeader } from "./sections/resume-header";
import { ResumeSummary } from "./sections/resume-summary";
import { ResumeExperience } from "./sections/resume-experience";
import { ResumeEducation } from "./sections/resume-education";
import { ResumeSkills } from "./sections/resume-skills";
import { ResumeProjects } from "./sections/resume-projects";
import { ResumeCertifications } from "./sections/resume-certifications";
import { ResumeLayoutManager } from "./sections/resume-layout-manager";
import ResumePreview from "./resume-preview";
import { useResumes } from "../../hooks/use-resumes";
import { 
  type ResumeFormData, 
  type Template, 
  type SavedResume,
  type ProjectFormData,
  type ResumeContent,
  type Resume,
  type PreviewData,
  normalizeTechnologies,
  normalizeTemplate,
  defaultFormValues,
  formToDbFormat,
  toPreviewData
} from "../../types/resume";

interface ResumeBuilderProps {
  activeResume?: SavedResume | null;
  setActiveResume?: (resume: SavedResume) => void;
  selectedTemplate?: Template;
  onSave?: (data: ResumeFormData) => void;
}

const getDefaultSections = () => [
  'header',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications'
];

export function ResumeBuilder({
  activeResume,
  setActiveResume,
  selectedTemplate: initialTemplate,
  onSave,
}: ResumeBuilderProps): JSX.Element {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const initialTemplateValue = normalizeTemplate(initialTemplate || activeResume?.content?.template || 'professional');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(initialTemplateValue);
  const [tempName, setTempName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  
  const lastSavedSections = useRef<string[]>(getDefaultSections());
  const { updateResume, refreshResumes, createResume } = useResumes();
  
  const defaultValues: ResumeFormData = {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    template: initialTemplateValue,
    sections: getDefaultSections(),
  };

  const form = useForm<ResumeFormData>({
    defaultValues: activeResume?.content ? {
      ...activeResume.content,
      template: initialTemplateValue,
      sections: activeResume.content.sections || getDefaultSections(),
      personalInfo: {
        ...defaultValues.personalInfo,
        ...activeResume.content.personalInfo,
      },
      experience: activeResume.content.experience || [],
      education: activeResume.content.education || [],
      skills: activeResume.content.skills || [],
      projects: activeResume.content.projects || [],
      certifications: activeResume.content.certifications || [],
    } : defaultValues
  });

  useEffect(() => {
    const template = normalizeTemplate(activeResume?.content?.template || initialTemplate || 'professional');
    if (activeResume?.content) {
      const formData = {
        ...defaultValues,
        ...activeResume.content,
        template,
        sections: activeResume.content.sections || getDefaultSections(),
        personalInfo: {
          ...defaultValues.personalInfo,
          ...activeResume.content.personalInfo,
        },
        experience: activeResume.content.experience || [],
        education: activeResume.content.education || [],
        skills: activeResume.content.skills || [],
        projects: activeResume.content.projects || [],
        certifications: activeResume.content.certifications || [],
      };
      form.reset(formData);
      setSkills(activeResume.content.skills || []);
    } else {
      form.reset(defaultValues);
      setSkills([]);
    }
    setSelectedTemplate(template);
  }, [activeResume, form, initialTemplate]);

  const handleSectionsChange = useCallback(async (newSections: string[]) => {
    if (!activeResume || !activeResume.id) return;

    try {
      form.setValue("sections", newSections, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });

      const values = form.getValues();
      const normalizedFormData: ResumeFormData = {
        ...values,
        skills,
        sections: newSections,
        template: selectedTemplate,
        projects: values.projects?.map((project: ProjectFormData) => ({
          ...project,
          technologies: normalizeTechnologies(project.technologies),
        })) || [],
        certifications: values.certifications || [],
      };

      const dbContent = {
        ...formToDbFormat(normalizedFormData),
        template: selectedTemplate // Ensure template is set
      };
      const resumeName = String(values.personalInfo?.fullName || 'Untitled Resume');
      await updateResume(activeResume.id, resumeName, dbContent);

      if (setActiveResume) {
        setActiveResume({
          ...activeResume,
          name: resumeName,
          content: dbContent,
        });
      }

      lastSavedSections.current = newSections;

      await refreshResumes();
      toast({ title: "Layout updated successfully" });
    } catch (error) {
      console.error('Error handling section changes:', error);
      toast({ title: "Failed to update sections", variant: "destructive" });
      
      form.setValue("sections", lastSavedSections.current);
    }
  }, [form, activeResume, skills, selectedTemplate, updateResume, setActiveResume, refreshResumes]);

  const handleSaveName = async (resumeId: string | undefined) => {
    if (!resumeId) {
      toast({ title: "No resume selected", variant: "destructive" });
      return;
    }
    if (!tempName.trim()) {
      toast({ title: "Resume name cannot be empty", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName }),
      });

      if (!response.ok) throw new Error('Failed to update resume name');

      if (activeResume && activeResume.id === resumeId && setActiveResume) {
        setActiveResume({
          ...activeResume,
          name: tempName,
        });
      }

      await refreshResumes();
      setEditingName(null);
      toast({ title: "Resume name updated successfully" });
    } catch (error) {
      console.error('Error updating resume name:', error);
      toast({ 
        title: error instanceof Error ? error.message : 'Failed to update resume name',
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    if (!activeResume?.id) {
      toast({ title: "Please save your resume first", variant: "destructive" });
      return;
    }

    try {
      // Use the format/[id] endpoint to generate and download PDF
      const response = await fetch(`/api/resumes/export/format/pdf/${activeResume.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export resume');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a link to download the PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeResume.name || 'resume'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Resume exported successfully" });
    } catch (error) {
      console.error("Error exporting resume:", error);
      toast({ 
        title: error instanceof Error ? error.message : "Failed to export resume",
        variant: "destructive" 
      });
    }
  };

  const onSubmit = async (formData: ResumeFormData) => {
    try {
      let currentResumeId = activeResume?.id;

      // If no active resume, create a new one
      if (!currentResumeId) {
        const content = formToDbFormat({
          ...formData,
          skills,
          template: normalizeTemplate(selectedTemplate),
          sections: getDefaultSections()
        });
        
        const newResume = await createResume({
          title: formData.personalInfo?.fullName || 'Untitled Resume',
          content,
          template: normalizeTemplate(selectedTemplate)
        });
        
        currentResumeId = newResume.id;
        
        if (setActiveResume) {
          setActiveResume(newResume);
        }
      }

      const normalizedFormData: ResumeFormData = {
        ...formData,
        skills,
        sections: formData.sections || getDefaultSections(),
        template: selectedTemplate,
        projects: formData.projects?.map((project: ProjectFormData) => ({
          ...project,
          technologies: normalizeTechnologies(project.technologies),
        })) || [],
        certifications: formData.certifications || [],
      };

      const dbContent = {
        ...formToDbFormat(normalizedFormData),
        template: selectedTemplate
      };
      const resumeName = activeResume?.name || formData.personalInfo?.fullName || 'Untitled Resume';
      if (!currentResumeId) {
        throw new Error('Failed to create or update resume');
      }
      await updateResume(currentResumeId, resumeName, dbContent);

      if (setActiveResume) {
        setActiveResume({
          id: currentResumeId,
          name: resumeName,
          content: dbContent,
          createdAt: activeResume?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (onSave) {
        onSave(formData);
      }

      await refreshResumes();
      toast({ title: "Resume saved successfully" });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({ 
        title: error instanceof Error ? error.message : 'Failed to save resume',
        variant: "destructive"
      });
    }
  };

  // ... (keeping the rest of the component the same)

  return (
    <FormProvider {...form}>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Template Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Choose a Template</h2>
          <ResumeTemplates 
            onSelect={(templateId) => {
              const normalizedTemplate = normalizeTemplate(templateId);
              
              // Get current form values and ensure all fields are defined
              const currentValues = form.getValues();
              const updatedValues = {
                ...defaultValues,
                ...currentValues,
                template: normalizedTemplate,
                personalInfo: {
                  ...defaultValues.personalInfo,
                  ...currentValues.personalInfo,
                },
                experience: currentValues.experience || [],
                education: currentValues.education || [],
                skills: currentValues.skills || [],
                projects: currentValues.projects || [],
                certifications: currentValues.certifications || [],
                sections: currentValues.sections || getDefaultSections(),
              };
              
              // Update state and form
              setSelectedTemplate(normalizedTemplate);
              form.reset(updatedValues);
            }} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ResumeHeader form={form} />
              <ResumeSummary form={form} />
              <ResumeExperience 
                form={form}
                onAdd={() => {
                  const experiences = form.getValues("experience") || [];
                  form.setValue("experience", [...experiences, {
                    title: "",
                    company: "",
                    duration: "",
                    description: "",
                    startDate: "",
                    endDate: ""
                  }]);
                }}
                onRemove={(index: number) => {
                  const experiences = form.getValues("experience") || [];
                  form.setValue("experience", experiences.filter((_, i) => i !== index));
                }}
              />
              <ResumeEducation 
                form={form}
                onAdd={() => {
                  const education = form.getValues("education") || [];
                  form.setValue("education", [...education, {
                    degree: "",
                    school: "",
                    year: "",
                    graduationDate: ""
                  }]);
                }}
                onRemove={(index: number) => {
                  const education = form.getValues("education") || [];
                  form.setValue("education", education.filter((_, i) => i !== index));
                }}
              />
              <ResumeSkills 
                skills={skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                onAdd={() => {
                  if (newSkill.trim()) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill('');
                  }
                }}
                onRemove={(index: number) => {
                  setSkills(skills.filter((_, i) => i !== index));
                }}
              />
              <ResumeProjects 
                form={form}
                onAdd={() => {
                  const projects = form.getValues("projects") || [];
                  form.setValue("projects", [...projects, {
                    name: "",
                    description: "",
                    technologies: [],
                    url: ""
                  }]);
                }}
                onRemove={(index: number) => {
                  const projects = form.getValues("projects") || [];
                  form.setValue("projects", projects.filter((_, i) => i !== index));
                }}
              />
              <ResumeCertifications 
                form={form}
                onAdd={() => {
                  const certifications = form.getValues("certifications") || [];
                  form.setValue("certifications", [...certifications, {
                    name: "",
                    issuer: "",
                    date: "",
                    url: ""
                  }]);
                }}
                onRemove={(index: number) => {
                  const certifications = form.getValues("certifications") || [];
                  form.setValue("certifications", certifications.filter((_, i) => i !== index));
                }}
              />
              <ResumeLayoutManager 
                sections={form.watch("sections") || getDefaultSections()}
                onChange={handleSectionsChange}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Resume
              </Button>
            </form>
          </div>
          <div className="sticky top-4 h-fit">
            <ResumePreview 
              data={{
                ...form.watch(),
                skills,
                template: selectedTemplate
              }}
              templateId={selectedTemplate}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
