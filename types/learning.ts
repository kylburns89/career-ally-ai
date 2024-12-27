export interface SkillGap {
  skill: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel?: string;
  targetLevel?: string;
}

export interface LearningResource {
  title: string;
  url: string;
  description: string;
  type: string;
  duration: string;
  difficulty?: string;
  skills: string[];
  provider?: string;
  cost?: string;
  certification?: boolean;
}

export interface LearningPath {
  skillGaps: SkillGap[];
  resources: LearningResource[];
  lastUpdated?: string;
  nextReviewDate?: string;
}

export interface LearningPathModel {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  skillGaps: SkillGap[];
  resources: LearningResource[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
