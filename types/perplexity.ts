export interface Source {
  title: string;
  url: string;
  description?: string;
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
  sources: Source[];
  relatedQuestions: Array<{
    question: string;
    description: string;
  }>;
}
