import { MarketAnalysis } from '../types/perplexity';
import { AdaptedSearchResult } from '../types/brave';
import Together from "together-ai";
import { createOpenAI } from '@ai-sdk/openai';

if (!process.env.TOGETHER_API_KEY) {
  throw new Error('Missing TOGETHER_API_KEY environment variable');
}

// Together.ai client for non-streaming operations
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
});

// Together.ai client for streaming operations
const togetherStream = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
  baseURL: "https://api.together.xyz/v1",
});

export async function generateMarketAnalysis(role: string, searchResults: AdaptedSearchResult[]): Promise<MarketAnalysis> {
  // Create a mapping of search results with their URLs for citation
  const sourcesWithUrls = searchResults.map((result, index) => ({
    id: index + 1,
    title: result.title,
    url: result.url, // Use the specific article URL
    icon: `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`,
    description: result.content.substring(0, 150) + '...'
  }));

  const prompt = `You are a market research expert. You must return ONLY a raw JSON object with no additional text or explanation. The response must start with "{" and end with "}" - do not include any other text before or after the JSON.

Here are the search results to use as sources:

${searchResults.map((result, index) => `[${index + 1}] ${result.content}\nSource: ${result.url}\n\n`)}

Generate a market analysis JSON object for ${role} positions following these rules:
9. For relatedQuestions, generate 5 contextual questions based on the analysis, replacing [role] with "${role}"
10. Each question should focus on a different aspect (trends, requirements, progression, compensation, skills)
11. Questions should reference specific insights from the analysis
1. Return ONLY the raw JSON object - no explanations or text before/after
2. Use numbers for all numerical values, no strings
3. Salary values should be in USD without currency symbols
4. All percentages should be numbers
5. Citations should be numbers referencing the sources array
6. Write content in a natural, narrative style
7. Include citations from the provided sources, using their index numbers [1-${searchResults.length}]
8. The JSON must exactly match this structure:

{
  "overview": "A concise overview of the current job market for this role",
  "demandAndOpportunities": {
    "content": "Analysis of current demand and future opportunities",
    "citations": [1, 3]
  },
  "salaryRange": {
    "content": "Overview of salary expectations",
    "rates": {
      "hourlyRate": {
        "average": 62.15,
        "min": 13.22,
        "max": 91.35,
        "citation": 2
      },
      "annualRange": {
        "min": 101500,
        "max": 190000,
        "commonMin": 116500,
        "commonMax": 160999,
        "citation": 2
      },
      "seniorRange": {
        "min": 137000,
        "max": 208000,
        "yearsExperience": 5,
        "citation": 6
      }
    },
    "locationFactors": {
      "content": "How location affects salary (e.g., higher in major tech hubs)",
      "citation": 6
    },
    "industryFactors": {
      "content": "How industry affects salary (e.g., higher in finance)",
      "citation": 6
    }
  },
  "skillsInDemand": {
    "content": "Overview of required skills and competencies",
    "skills": {
      "core": [
        "List of core skills required",
        "Both technical and soft skills"
      ],
      "technical": [
        {
          "skill": "Specific technical skill",
          "demandPercentage": 60,
          "citation": 3
        }
      ]
    }
  },
  "sources": ${JSON.stringify(sourcesWithUrls, null, 2)},
  "relatedQuestions": [
    {
      "question": "string (A specific question about emerging trends mentioned in the analysis)",
      "description": "string (Brief context about why this question is relevant)"
    },
    {
      "question": "string (A specific question about industry requirements from the analysis)",
      "description": "string (Brief context about why this question is relevant)"
    },
    {
      "question": "string (A specific question about career paths based on the analysis)",
      "description": "string (Brief context about why this question is relevant)"
    },
    {
      "question": "string (A specific question about regional factors from the analysis)",
      "description": "string (Brief context about why this question is relevant)"
    },
    {
      "question": "string (A specific question about skills or certifications mentioned)",
      "description": "string (Brief context about why this question is relevant)"
    }
  ]
}`;

  try {
    const response = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        { 
          role: 'system', 
          content: 'You are a market research expert. You must return ONLY raw JSON data with no additional text. Your response must start with "{" and end with "}" - do not include any other text before or after the JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    if (!response.choices?.length) {
      throw new Error('No choices returned from Together.ai');
    }

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content generated from Together.ai');
    }

    // Extract JSON from the content (in case there's any extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in response');
    }

    // Parse the JSON to validate it
    const jsonContent = JSON.parse(jsonMatch[0]);

    return jsonContent as MarketAnalysis;
  } catch (error) {
    console.error('Market analysis error:', error);
    throw error;
  }
}
