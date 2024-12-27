export interface Profile {
  id: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[];
  experience: any[];
  education: any[];
  certifications: any[];
  createdAt: string;
  updatedAt: string;
}
