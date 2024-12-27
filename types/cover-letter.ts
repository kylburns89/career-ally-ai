export interface CoverLetter {
  id: string;
  userId: string;
  name: string;
  content: string;
  jobTitle?: string;
  company?: string;
  template?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CoverLetterTemplate = 'professional' | 'creative' | 'technical';

export interface CoverLetterFormData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeContent: string;
  industry: string;
}
