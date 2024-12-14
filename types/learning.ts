import { AdaptedSearchResult } from './brave';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  provider: string;
  type: 'course' | 'tutorial' | 'documentation' | 'certification';
  skillArea: string;
  completed: boolean;
  progress: number;
  startDate?: Date;
  completionDate?: Date;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  resources: LearningResource[];
  certifications: AdaptedSearchResult[];
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  skillGaps: SkillGap[];
  createdAt: Date;
  updatedAt: Date;
}
