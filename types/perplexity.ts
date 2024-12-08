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

export interface MarketAnalysis {
  salary: {
    min: number;
    max: number;
    average: number;
  };
  jobOpenings: number;
  workModel: {
    remote: number;
    hybrid: number;
    onsite: number;
  };
  trends: {
    growthRate: number;
    yearOverYearChange: number;
    topSpecializations: Array<{
      name: string;
      growth: number;
    }>;
  };
  industryDemand: Array<{
    industry: string;
    demand: number;
  }>;
  geographicalHotspots: Array<{
    city: string;
    jobShare: number;
  }>;
  marketOutlook: {
    projectedGrowth: number;
    keyTrends: string[];
  };
}
