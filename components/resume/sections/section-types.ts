import { UseFormReturn } from "react-hook-form";
import type { ResumeFormData, Template, ProjectFormData } from "@/types/resume";

export interface BaseSectionProps {
  form: UseFormReturn<ResumeFormData>;
}

export interface ResumeHeaderProps extends BaseSectionProps {}

export interface ResumeSummaryProps extends BaseSectionProps {}

export interface ResumeExperienceProps extends BaseSectionProps {
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export interface ResumeEducationProps extends BaseSectionProps {
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export interface ResumeSkillsProps {
  skills: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  newSkill: string;
  setNewSkill: (value: string) => void;
}

export interface ResumeProjectsProps extends BaseSectionProps {
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export interface ResumeCertificationsProps extends BaseSectionProps {
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export interface ResumeTemplateSelectorProps {
  selectedTemplate: Template;
  onTemplateSelect: (templateId: Template) => void;
}

// Helper type to ensure technologies is always string[]
export type NormalizedProjectFormData = Omit<ProjectFormData, 'technologies'> & {
  technologies: string[];
};

export type NormalizedResumeFormData = Omit<ResumeFormData, 'projects'> & {
  projects?: NormalizedProjectFormData[];
};
