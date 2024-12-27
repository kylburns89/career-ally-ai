// Template types
export const TEMPLATES = [
  "professional",
  "minimal",
  "technical"
] as const;

export type Template = typeof TEMPLATES[number];
export type FormTemplate = Template | null | string;

// Template preview interface
export interface TemplatePreview {
  id: Template;
  name: string;
  description: string;
  preview: string;
  status?: string;
}

// Form-specific interfaces
export interface ExperienceFormData {
  title: string;
  company: string;
  duration: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface EducationFormData {
  degree: string;
  school: string;
  year: string;
  graduationDate?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  technologies: string | string[];
  url?: string;
  link?: string; // For backward compatibility
}

export interface CertificationFormData {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

// Base interfaces
export interface BasePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  name?: string; // For backward compatibility
}

export interface BaseExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface BaseEducation {
  degree: string;
  school: string;
  year: string;
  graduationDate?: string;
}

export interface BaseProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  link?: string; // For backward compatibility
}

export interface BaseCertification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

// Form data interface
export interface ResumeFormData {
  personalInfo: BasePersonalInfo;
  summary: string;
  experience: ExperienceFormData[];
  education: EducationFormData[];
  skills: string[];
  projects?: ProjectFormData[];
  certifications?: CertificationFormData[];
  template: FormTemplate;
  sections?: string[];
}

// Preview data interface that matches the form data structure
export interface PreviewData extends Omit<ResumeFormData, 'template'> {
  template: FormTemplate;
}

// Main API/Database interfaces
export interface ResumeData {
  personalInfo: BasePersonalInfo;
  summary: string;
  experience: BaseExperience[];
  education: BaseEducation[];
  skills: string[];
  projects?: BaseProject[];
  certifications?: BaseCertification[];
  template: Template;
  sections?: string[];
}

export interface ResumeContent extends ResumeData {
  template: Template; // Required for database storage
}

export interface SavedResume {
  id?: string;
  name: string;
  content: ResumeContent;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  file_url?: string;
}

export interface Resume extends SavedResume {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  updated_at?: string; // For backward compatibility
  file_url?: string;
}

// Resume Analysis Interface
export interface ResumeAnalysis {
  score: number;
  atsCompatibility: {
    score: number;
    keywords: {
      present: string[];
      missing: string[];
    };
    formatting: {
      issues: string[];
      suggestions: string[];
    };
  };
  sections: {
    [key: string]: {
      score: number;
      impact: "high" | "medium" | "low";
      feedback: string[];
      suggestions: string[];
    };
  };
  industryComparison: {
    score: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  improvements: Array<{
    section: string;
    original: string;
    improved: string;
    explanation: string;
  }>;
  actionItems: {
    high: string[];
    medium: string[];
    low: string[];
  };
}

// Type guard functions
export function isValidDate(date: string | undefined): date is string {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Helper functions
export function normalizeTechnologies(technologies: string | string[]): string[] {
  if (Array.isArray(technologies)) {
    return technologies.filter(Boolean);
  }
  return technologies.split(',').map(t => t.trim()).filter(Boolean);
}

export function normalizeTemplate(template: FormTemplate): Template {
  if (!template) return "professional";
  const normalizedTemplate = template.toLowerCase();
  return isValidTemplate(normalizedTemplate) ? normalizedTemplate : "professional";
}

export function toPreviewData(formData: ResumeFormData): PreviewData {
  return {
    ...formData,
    template: formData.template || "professional",
    projects: formData.projects?.map(project => ({
      ...project,
      technologies: normalizeTechnologies(project.technologies),
    })),
    certifications: formData.certifications || [],
  };
}

export function dbToFormFormat(content: ResumeContent): ResumeFormData {
  return {
    ...content,
    summary: content.summary || "",
    experience: content.experience.map(exp => ({
      ...exp,
      description: exp.description,
      duration: exp.duration || formatDateRange(exp.startDate, exp.endDate),
    })),
    education: content.education.map(edu => ({
      ...edu,
      year: edu.year || edu.graduationDate || '',
    })),
    skills: content.skills || [],
    projects: content.projects?.map(project => ({
      ...project,
      technologies: project.technologies,
      url: project.url || project.link,
    })) || [],
    certifications: content.certifications || [],
    template: content.template,
    sections: content.sections || [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ],
  };
}

export function formToDbFormat(formData: ResumeFormData): ResumeContent {
  const template = normalizeTemplate(formData.template);
  
  const experience = formData.experience.map(exp => ({
    ...exp,
    duration: exp.duration || formatDateRange(exp.startDate, exp.endDate),
  }));

  const projects = formData.projects?.map(project => ({
    ...project,
    technologies: normalizeTechnologies(project.technologies),
    url: project.url || project.link,
  })) || [];

  const certifications = formData.certifications || [];

  return {
    personalInfo: formData.personalInfo,
    summary: formData.summary || "",
    experience,
    education: formData.education,
    skills: formData.skills,
    projects,
    certifications,
    template,
    sections: formData.sections || [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ],
  };
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return "";
  return endDate ? `${startDate} - ${endDate}` : `${startDate} - Present`;
}

export function parseDuration(duration: string): { startDate?: string; endDate?: string } {
  if (!duration) return {};
  const [start, end] = duration.split(" - ");
  return {
    startDate: start || undefined,
    endDate: end === "Present" ? undefined : end,
  };
}

export function formatDate(date: string | undefined): string {
  if (!date || !isValidDate(date)) return "";
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

// Default form values
export const defaultFormValues: ResumeFormData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [{ title: "", company: "", duration: "", description: "" }],
  education: [{ degree: "", school: "", year: "" }],
  skills: [],
  projects: [],
  certifications: [],
  template: "professional",
  sections: [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ],
};

// Template validation and conversion
export function getTemplateId(template: FormTemplate): Template {
  if (!template) return "professional";
  const templateId = template.toLowerCase();
  if (isValidTemplate(templateId)) {
    return templateId;
  }
  return "professional";
}

export function isValidTemplate(template: string | null): template is Template {
  if (!template) return false;
  return TEMPLATES.includes(template.toLowerCase() as Template);
}
