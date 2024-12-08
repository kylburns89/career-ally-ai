// Base types for personal information
interface BasePersonalInfo {
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

// Form version of personal info (uses fullName)
interface FormPersonalInfo extends BasePersonalInfo {
  fullName: string;
}

// Database version of personal info (uses name)
interface DbPersonalInfo extends BasePersonalInfo {
  name: string;
}

// Base experience type for the form
interface FormExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

// Database experience type
interface DbExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string[];
}

// Base education type for the form
interface FormEducation {
  degree: string;
  school: string;
  year: string;
}

// Database education type
interface DbEducation {
  degree: string;
  school: string;
  graduationDate: string;
}

// Project type
interface Project {
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

// Certification type
interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

// Form data structure
export interface ResumeData {
  personalInfo: FormPersonalInfo;
  experience: FormExperience[];
  education: FormEducation[];
  skills: string[];
  projects?: Project[];
  certifications?: Certification[];
  template: string | null;
  sections?: string[];
}

// Database content structure
export interface ResumeContent {
  personalInfo: DbPersonalInfo;
  experience: DbExperience[];
  education: DbEducation[];
  skills: string[];
  projects?: Project[];
  certifications?: Certification[];
  template: string | null;
  sections?: string[];
}

// Database resume record
export interface Resume {
  id: string;
  user_id: string;
  name: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
  analysis?: ResumeAnalysis | null;
  file_url?: string | null;
}

// Data structure for saving a new resume
export interface SavedResume {
  name: string;
  content: ResumeContent;
}

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

// Helper function to convert form data to database format
export function formToDbFormat(formData: ResumeData): ResumeContent {
  return {
    personalInfo: {
      name: formData.personalInfo.fullName,
      email: formData.personalInfo.email,
      phone: formData.personalInfo.phone,
      location: formData.personalInfo.location,
      linkedin: formData.personalInfo.linkedin,
      website: formData.personalInfo.website,
    },
    experience: formData.experience.map(exp => ({
      title: exp.title,
      company: exp.company,
      startDate: exp.duration.split('-')[0].trim(),
      endDate: exp.duration.includes('-') ? exp.duration.split('-')[1].trim() : undefined,
      description: exp.description.split('\n').map(line => line.trim()).filter(Boolean),
    })),
    education: formData.education.map(edu => ({
      degree: edu.degree,
      school: edu.school,
      graduationDate: edu.year,
    })),
    skills: formData.skills,
    projects: formData.projects,
    certifications: formData.certifications,
    template: formData.template,
    sections: formData.sections,
  };
}

// Helper function to convert database format to form data
export function dbToFormFormat(dbData: ResumeContent): ResumeData {
  return {
    personalInfo: {
      fullName: dbData.personalInfo.name,
      email: dbData.personalInfo.email,
      phone: dbData.personalInfo.phone,
      location: dbData.personalInfo.location,
      linkedin: dbData.personalInfo.linkedin,
      website: dbData.personalInfo.website,
    },
    experience: dbData.experience.map(exp => ({
      title: exp.title,
      company: exp.company,
      duration: `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`,
      description: exp.description.join('\n'),
    })),
    education: dbData.education.map(edu => ({
      degree: edu.degree,
      school: edu.school,
      year: edu.graduationDate,
    })),
    skills: dbData.skills,
    projects: dbData.projects,
    certifications: dbData.certifications,
    template: dbData.template,
    sections: dbData.sections,
  };
}
