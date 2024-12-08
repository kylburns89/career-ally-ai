export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  source: string;
  published_date?: string;
  author?: string;
}

export interface TavilySearchAPIResponse {
  results: TavilySearchResult[];
  query: string;
  status: string;
}

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
  certifications: TavilySearchResult[];
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
