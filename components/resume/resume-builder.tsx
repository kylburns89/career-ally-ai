import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
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
  normalizeTechnologies,
  defaultFormValues,
  formToDbFormat
} from "../../types/resume";
import type { Database } from "../../types/database";
import type { Json } from "../../types/database";

interface ResumeBuilderProps {
  activeResume?: SavedResume;
  setActiveResume?: (resume: SavedResume | undefined) => void;
  selectedTemplate?: Template;
  onSave?: (data: ResumeFormData) => void;
}

const TEMPLATES = [
  { 
    id: "professional", 
    name: "Professional", 
    preview: "/templates/professional.png",
    description: "A clean and modern template suitable for most industries"
  },
  { 
    id: "minimal", 
    name: "Minimal", 
    preview: "/templates/minimal.png",
    description: "Clean and concise design that focuses on essential information"
  },
  { 
    id: "technical", 
    name: "Technical", 
    preview: "/templates/technical.png",
    description: "Optimized for software developers and IT professionals"
  }
] as const;

// Debounce helper function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Ensure sections are never undefined
function getDefaultSections(): string[] {
  return [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ];
}

export function ResumeBuilder({
  activeResume,
  setActiveResume,
  selectedTemplate: initialTemplate,
  onSave,
}: ResumeBuilderProps): JSX.Element {
  const { resumes = [], deleteResume, updateResume, refreshResumes } = useResumes();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(initialTemplate || "professional");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Initialize with default sections
  const lastSavedSections = useRef<string[]>(getDefaultSections());
  
  const supabase = createClientComponentClient<Database>();

  const form = useForm<ResumeFormData>({
    defaultValues: {
      ...defaultFormValues,
      sections: getDefaultSections()
    }
  });

  // Update form and state when active resume changes
  useEffect(() => {
    if (activeResume?.content) {
      const { skills: resumeSkills, template, sections } = activeResume.content;
      setSkills(resumeSkills || []);
      setSelectedTemplate(template || "professional");
      const currentSections = sections || getDefaultSections();
      
      // Only update sections on initial load or when switching resumes
      if (isInitialLoad || lastSavedSections.current.join(',') !== currentSections.join(',')) {
        lastSavedSections.current = currentSections;
        form.reset({
          ...activeResume.content,
          sections: currentSections
        });
      } else {
        // Preserve current sections order but update other fields
        const currentFormSections = form.getValues("sections");
        form.reset({
          ...activeResume.content,
          sections: currentFormSections
        });
      }
    } else {
      setSkills([]);
      setSelectedTemplate("professional");
      const defaultSections = getDefaultSections();
      lastSavedSections.current = defaultSections;
      form.reset({
        ...defaultFormValues,
        sections: defaultSections
      });
    }
    setIsInitialLoad(false);
  }, [activeResume, form, isInitialLoad]);

  // Debounced save function
  const debouncedSave = useCallback(
    (resumeId: string, formData: ResumeFormData) => {
      const save = async () => {
        try {
          setIsSaving(true);
          const dbContent = formToDbFormat({
            ...formData,
            sections: formData.sections || getDefaultSections()
          });
          
          await updateResume(resumeId, activeResume?.name || '', dbContent);
          
          if (setActiveResume && activeResume) {
            setActiveResume({
              ...activeResume,
              content: dbContent,
            });
          }

          lastSavedSections.current = formData.sections || getDefaultSections();
          await refreshResumes();
        } catch (error) {
          console.error('Error saving resume:', error);
          toast.error('Failed to save changes. Please try again.');
          
          // Revert form state to last known good state
          form.setValue("sections", lastSavedSections.current);
        } finally {
          setIsSaving(false);
        }
      };
      
      const timeoutId = setTimeout(save, 1000);
      return () => clearTimeout(timeoutId);
    },
    [updateResume, setActiveResume, activeResume, refreshResumes, form]
  );

  const handleSectionsChange = useCallback(async (newSections: string[]) => {
    if (!activeResume?.id) return;

    try {
      // Update form state immediately for responsive UI
      form.setValue("sections", newSections, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });

      // Get current form values
      const formData = form.getValues();
      const normalizedFormData: ResumeFormData = {
        ...formData,
        skills,
        sections: newSections,
        template: selectedTemplate,
        projects: formData.projects?.map((project: ProjectFormData) => ({
          ...project,
          technologies: normalizeTechnologies(project.technologies),
        })) || [],
        certifications: formData.certifications || [],
      };

      // Save immediately without debounce for layout changes
      const dbContent = formToDbFormat(normalizedFormData);
      await updateResume(activeResume.id, activeResume.name, dbContent);

      if (setActiveResume) {
        setActiveResume({
          ...activeResume,
          content: dbContent,
        });
      }

      // Update last saved sections
      lastSavedSections.current = newSections;

      await refreshResumes();
      toast.success("Layout updated successfully");
    } catch (error) {
      console.error('Error handling section changes:', error);
      toast.error('Failed to update sections');
      
      // Revert to last known good state
      form.setValue("sections", lastSavedSections.current);
    }
  }, [form, activeResume, skills, selectedTemplate, updateResume, setActiveResume, refreshResumes]);

  const handleCreateResume = async () => {
    const defaultSections = getDefaultSections();
    const newResume: ResumeContent = {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      template: "professional",
      sections: defaultSections,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const dbContent = JSON.parse(JSON.stringify(newResume)) as Json;

      const { data: resume, error } = await supabase
        .from('resumes')
        .insert({
          user_id: session.user.id,
          name: "Resume " + format(new Date(), 'MM/dd/yyyy'),
          content: dbContent,
        })
        .select()
        .single();

      if (error) throw error;

      const transformedResume: SavedResume = {
        id: resume.id,
        userId: resume.user_id,
        name: resume.name,
        content: newResume,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
      };

      if (setActiveResume) {
        setActiveResume(transformedResume);
      }
      
      form.reset(newResume);
      setSkills([]);
      setSelectedTemplate("professional");
      lastSavedSections.current = defaultSections;

      await refreshResumes();

      toast.success("New resume created successfully");
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create resume');
    }
  };

  const handleStartEditName = (resumeId: string, currentName: string) => {
    setEditingName(resumeId);
    setTempName(currentName);
  };

  const handleSaveName = async (resumeId: string) => {
    if (!tempName.trim()) {
      toast.error("Resume name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from('resumes')
        .update({ name: tempName })
        .eq('id', resumeId);

      if (error) throw error;

      if (activeResume && activeResume.id === resumeId && setActiveResume) {
        setActiveResume({
          ...activeResume,
          name: tempName,
        });
      }

      await refreshResumes();
      setEditingName(null);
      toast.success("Resume name updated successfully");
    } catch (error) {
      console.error('Error updating resume name:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resume name');
    }
  };

  const handleCancelEditName = () => {
    setEditingName(null);
    setTempName("");
  };

  const handleTemplateSelect = (templateId: Template) => {
    setSelectedTemplate(templateId);
    form.setValue("template", templateId);
  };

  const handleDeleteResume = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      await deleteResume(id);
      if (activeResume?.id === id && setActiveResume) {
        setActiveResume(undefined);
      }
      await refreshResumes();
    }
  };

  const handleExport = async () => {
    if (!activeResume?.id) {
      toast.error("Please save your resume first");
      return;
    }

    try {
      const response = await fetch("/api/resumes/export/pdf/" + activeResume.id, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Export failed with status: " + response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (activeResume.name || 'resume') + '.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Resume exported successfully");
    } catch (error) {
      console.error("Error exporting resume:", error);
      toast.error("Failed to export resume");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
      form.setValue("skills", updatedSkills);
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    form.setValue("skills", updatedSkills);
  };

  const onSubmit = async (formData: ResumeFormData) => {
    if (!activeResume?.id) {
      toast.error("No active resume selected");
      return;
    }

    try {
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

      const dbContent = formToDbFormat(normalizedFormData);

      await updateResume(activeResume.id, activeResume.name, dbContent);

      if (setActiveResume) {
        setActiveResume({
          ...activeResume,
          content: dbContent,
        });
      }

      if (onSave) {
        onSave(formData);
      }

      await refreshResumes();

      toast.success("Resume saved successfully");
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save resume');
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "summary":
        return <ResumeSummary form={form} />;
      case "experience":
        return (
          <ResumeExperience
            form={form}
            onAdd={() => {
              const current = form.getValues("experience") || [];
              form.setValue("experience", [...current, { title: "", company: "", duration: "", description: "" }]);
            }}
            onRemove={(index) => {
              const current = form.getValues("experience") || [];
              form.setValue("experience", current.filter((_, i) => i !== index));
            }}
          />
        );
      case "education":
        return (
          <ResumeEducation
            form={form}
            onAdd={() => {
              const current = form.getValues("education") || [];
              form.setValue("education", [...current, { degree: "", school: "", year: "" }]);
            }}
            onRemove={(index) => {
              const current = form.getValues("education") || [];
              form.setValue("education", current.filter((_, i) => i !== index));
            }}
          />
        );
      case "skills":
        return (
          <ResumeSkills
            skills={skills}
            onAdd={addSkill}
            onRemove={removeSkill}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
          />
        );
      case "projects":
        return (
          <ResumeProjects
            form={form}
            onAdd={() => {
              const current = form.getValues("projects") || [];
              form.setValue("projects", [...current, { name: "", description: "", technologies: [], url: "" }]);
            }}
            onRemove={(index) => {
              const current = form.getValues("projects") || [];
              form.setValue("projects", current.filter((_, i) => i !== index));
            }}
          />
        );
      case "certifications":
        return (
          <ResumeCertifications
            form={form}
            onAdd={() => {
              const current = form.getValues("certifications") || [];
              form.setValue("certifications", [...current, { name: "", issuer: "", date: "", url: "" }]);
            }}
            onRemove={(index) => {
              const current = form.getValues("certifications") || [];
              form.setValue("certifications", current.filter((_, i) => i !== index));
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Your Resumes</h2>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={handleExport} 
              disabled={!activeResume?.id}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export PDF
            </button>
            <button 
              onClick={handleCreateResume}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create New Resume
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {resumes.map((resume: Resume) => (
            <div key={resume.id} className="relative flex-shrink-0 pt-3 pr-3">
              <button
                onClick={() => setActiveResume?.(resume)}
                className={"w-[200px] p-4 rounded-lg border-2 transition-all hover:border-primary " + 
                  (activeResume?.id === resume.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border')}
              >
                {editingName === resume.id ? (
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded bg-background text-foreground"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveName(resume.id)}
                        className="flex-1 p-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        <Check className="h-3 w-3 mx-auto" />
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        className="flex-1 p-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                      >
                        <X className="h-3 w-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between group">
                      <h3 className="font-medium truncate flex-1 text-foreground">{resume.name || 'Untitled Resume'}</h3>
                      <div className="relative flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditName(resume.id, resume.name);
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors relative group-hover:opacity-100 opacity-70"
                          title="Edit Resume Name"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Edit Name
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(resume.updatedAt), 'MM/dd/yyyy')}
                    </p>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteResume(resume.id)}
                className="absolute top-0 right-0 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-sm"
                title="Delete Resume"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,1.2fr,1fr] gap-8">
        <div className="space-y-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-lg shadow-sm border">
                <ResumeLayoutManager 
                  sections={form.getValues("sections") || getDefaultSections()} 
                  onChange={handleSectionsChange} 
                />
              </div>

              <div className="bg-card rounded-lg shadow-sm border p-6">
                <ResumeHeader form={form} />
              </div>

              <div className="space-y-6">
                {(form.getValues("sections") || getDefaultSections()).map((sectionId) => (
                  <div key={sectionId} className="bg-card rounded-lg shadow-sm border p-6">
                    {renderSection(sectionId)}
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Resume"}
                </button>
                <button 
                  type="button" 
                  onClick={handleExport} 
                  disabled={!activeResume?.id}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export PDF
                </button>
              </div>
            </form>
          </FormProvider>
        </div>

        <div className="xl:sticky xl:top-8 h-fit">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <ResumePreview data={form.watch()} templateId={selectedTemplate} />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-medium text-lg text-foreground">Choose Template</h3>
          <div className="grid gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id as Template)}
                className={"relative aspect-[210/297] w-full overflow-hidden rounded-lg border-2 transition-all hover:border-primary " + 
                  (selectedTemplate === template.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-muted')}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={template.preview}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-0 p-3 text-white">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-200">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
