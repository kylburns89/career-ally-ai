"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
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
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { 
  type ResumeFormData, 
  type Template, 
  type SavedResume,
  type ProjectFormData,
  type ResumeContent,
  type Resume,
  normalizeTechnologies,
  defaultFormValues
} from "../../types/resume";

interface ResumeBuilderProps {
  activeResume?: SavedResume;
  setActiveResume?: (resume: SavedResume) => void;
  selectedTemplate?: Template;
  onSave?: (data: ResumeFormData) => void;
}

const TEMPLATES = [
  { id: "professional", name: "Professional", preview: "/templates/professional.png" },
  { id: "creative", name: "Creative", preview: "/templates/creative.png" },
  { id: "technical", name: "Technical", preview: "/templates/technical.png" },
  { id: "modern", name: "Modern", preview: "/templates/modern.png" },
  { id: "executive", name: "Executive", preview: "/templates/executive.png" },
  { id: "minimal", name: "Minimal", preview: "/templates/minimal.png" },
] as const;

export function ResumeBuilder({
  activeResume,
  setActiveResume,
  selectedTemplate: initialTemplate,
  onSave,
}: ResumeBuilderProps): JSX.Element {
  const { resumes } = useResumes();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(initialTemplate || "professional");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [sections, setSections] = useState([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ]);

  const form = useForm<ResumeFormData>({
    defaultValues: {
      ...defaultFormValues,
      skills: [],
      sections: sections,
      template: selectedTemplate,
      ...(activeResume?.content || {})
    }
  });

  // Initialize form with active resume data
  useEffect(() => {
    if (activeResume?.content) {
      const { skills: resumeSkills, sections: resumeSections, template } = activeResume.content;
      
      setSkills(resumeSkills || []);
      setSections(resumeSections || sections);
      setSelectedTemplate(template || "professional");

      form.reset(activeResume.content);
    }
  }, [activeResume, sections, form]);

  const handleTemplateSelect = (templateId: Template) => {
    setSelectedTemplate(templateId);
    form.setValue("template", templateId);
  };

  const handleExport = async () => {
    if (!activeResume?.id) {
      toast.error("Please save your resume first");
      return;
    }

    try {
      const response = await fetch(`/api/resumes/export/pdf/${activeResume.id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.pdf`;
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

  const handleSectionsChange = useCallback((newSections: string[]) => {
    setSections(newSections);
    form.setValue("sections", newSections, { shouldDirty: true });
  }, [form]);

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
    const normalizedData: ResumeFormData = {
      ...formData,
      skills,
      sections,
      template: selectedTemplate,
      projects: formData.projects?.map((project: ProjectFormData) => ({
        ...project,
        technologies: normalizeTechnologies(project.technologies),
      })),
    };

    if (onSave) {
      onSave(normalizedData);
    }

    if (setActiveResume && activeResume) {
      const content: ResumeContent = {
        ...normalizedData,
        template: selectedTemplate,
        sections,
        projects: normalizedData.projects?.map(project => ({
          ...project,
          technologies: Array.isArray(project.technologies) 
            ? project.technologies 
            : project.technologies.split(',').map(t => t.trim()),
        })),
      };

      setActiveResume({
        ...activeResume,
        content,
      });
    }

    toast.success("Resume saved successfully");
  };

  return (
    <div className="container mx-auto py-8">
      {/* Resume Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Resumes</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create New Resume
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {resumes?.map((resume: Resume) => (
            <button
              key={resume.id}
              onClick={() => setActiveResume?.(resume)}
              className={`flex-shrink-0 w-[200px] p-4 rounded-lg border-2 transition-all hover:border-primary ${
                activeResume?.id === resume.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-200'
              }`}
            >
              <h3 className="font-medium truncate">{resume.name || 'Untitled Resume'}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(resume.updatedAt), 'MM/dd/yyyy')}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,1.2fr,1fr] gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <ResumeLayoutManager sections={sections} onChange={handleSectionsChange} />
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <ResumeHeader form={form} />
              </div>

              <div className="space-y-6">
                {sections.map((sectionId) => (
                  <div key={sectionId} className="bg-white rounded-lg shadow-sm border p-6">
                    {renderSection(sectionId)}
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Save Resume
                </button>
                <button 
                  type="button" 
                  onClick={handleExport} 
                  disabled={!activeResume?.id}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export PDF
                </button>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Middle Column - Preview */}
        <div className="xl:sticky xl:top-8 h-fit">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ResumePreview data={form.watch()} />
          </div>
        </div>

        {/* Right Column - Templates */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Choose Template</h3>
          <div className="grid gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id as Template)}
                className={`relative aspect-[210/297] w-full overflow-hidden rounded-lg border-2 transition-all hover:border-primary ${
                  selectedTemplate === template.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-muted'
                }`}
              >
                <img
                  src={template.preview}
                  alt={template.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-0 p-3 text-white">
                    <h4 className="font-medium">{template.name}</h4>
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
