import { Json } from './database';

export interface CoverLetterContent {
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  companyAddress?: string;
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface CoverLetter {
  id: string;
  name: string;
  job_title: string | null;
  company: string | null;
  user_id: string;
  content: string; // Store as string for direct display
  created_at: string;
  updated_at: string;
}

export interface NewCoverLetter {
  name: string;
  job_title: string | null;
  company: string | null;
  user_id: string;
  content: string;
}

export interface CoverLetterUpdate {
  name?: string;
  job_title?: string | null;
  company?: string | null;
  content?: string;
}

export interface SavedCoverLetter {
  id: string;
  user_id: string;
  content: Json;
  created_at: string;
  updated_at: string;
}
