import { TavilySearchAPIResponse } from '@/types/tavily';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

if (!TAVILY_API_KEY) {
  console.error('TAVILY_API_KEY is not set in environment variables');
}

async function makeRequest(query: string, options: any = {}): Promise<TavilySearchAPIResponse> {
  console.log('Making Tavily API request:', { query, ...options });
  
  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        ...options,
      }),
    });

    console.log('Tavily API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error:', errorText);
      throw new Error(`Tavily API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Tavily API response data:', data);
    return data;
  } catch (error) {
    console.error('Error making Tavily API request:', error);
    throw error;
  }
}

export async function searchLearningResources(query: string): Promise<TavilySearchAPIResponse> {
  console.log('Searching for learning resources:', query);
  return makeRequest(query, {
    include_domains: [
      'coursera.org',
      'udemy.com',
      'pluralsight.com',
      'linkedin.com/learning',
      'edx.org',
      'freecodecamp.org',
      'codecademy.com',
      'docs.microsoft.com',
      'developer.mozilla.org',
      'w3schools.com'
    ],
    filter_domains: [
      'youtube.com',
      'facebook.com',
      'twitter.com'
    ]
  });
}

export async function searchCertifications(skill: string): Promise<TavilySearchAPIResponse> {
  console.log('Searching for certifications:', skill);
  return makeRequest(`${skill} professional certification programs`, {
    include_domains: [
      'aws.amazon.com',
      'microsoft.com',
      'google.com',
      'cisco.com',
      'comptia.org',
      'isaca.org',
      'pmi.org',
      'coursera.org',
      'udemy.com'
    ]
  });
}
