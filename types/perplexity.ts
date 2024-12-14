export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: PerplexityMessage;
  delta?: {
    role: string;
    content: string;
  };
}

export interface PerplexityResponse {
  id: string;
  model: string;
  object: 'chat.completion';
  created: number;
  citations: string[];
  choices: PerplexityChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Source {
  id: number;
  title: string;
  url: string;
  icon: string;
  description: string;
}

export interface MarketAnalysis {
  overview: string;
  demandAndOpportunities: {
    content: string;
    citations: number[];
  };
  salaryRange: {
    content: string;
    rates: {
      hourlyRate: {
        average: number;
        min: number;
        max: number;
        citation: number;
      };
      annualRange: {
        min: number;
        max: number;
        commonMin: number;
        commonMax: number;
        citation: number;
      };
      seniorRange: {
        min: number;
        max: number;
        yearsExperience: number;
        citation: number;
      };
    };
    locationFactors: {
      content: string;
      citation: number;
    };
    industryFactors: {
      content: string;
      citation: number;
    };
  };
  skillsInDemand: {
    content: string;
    skills: {
      core: string[];
      technical: Array<{
        skill: string;
        demandPercentage: number;
        citation: number;
      }>;
    };
  };
  careerGrowth: {
    content: string;
    paths: Array<{
      role: string;
      salary: number;
      description: string;
      citation: number;
    }>;
  };
  marketOutlook: {
    content: string;
    keyPoints: string[];
    citation: number;
  };
  certifications: {
    content: string;
    citation: number;
  };
  sources: Source[];
}
