import { BraveSearchAPIResponse, AdaptedSearchResponse, AdaptedSearchResult } from '../types/brave';

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

if (!BRAVE_API_KEY) {
  console.error('BRAVE_API_KEY is not set in environment variables');
}

function adaptSearchResults(braveResponse: BraveSearchAPIResponse): AdaptedSearchResponse {
  // Handle case where web results are not present
  if (!braveResponse.web?.results) {
    return {
      results: [],
      query: braveResponse.query?.original || '',
      status: 'no_results'
    };
  }

  const adaptedResults: AdaptedSearchResult[] = braveResponse.web.results.map(result => ({
    title: result.title,
    url: result.url,
    content: result.description,
    score: result.family_friendly ? 1 : 0.5,
    source: result.meta_url.netloc,
    published_date: result.age || undefined
  }));

  return {
    results: adaptedResults,
    query: braveResponse.query.original,
    status: 'success'
  };
}

async function makeRequest(query: string): Promise<AdaptedSearchResponse> {
  console.log('Making Brave API request:', { query });
  
  // Using only the essential parameters as shown in the API documentation
  const params = new URLSearchParams({
    q: query
  });

  try {
    const response = await fetch(`${BRAVE_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY!
      }
    });

    console.log('Brave API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brave API error:', errorText);
      throw new Error(`Brave API error: ${response.status} ${errorText}`);
    }

    const data: BraveSearchAPIResponse = await response.json();
    console.log('Brave API response data:', data);
    return adaptSearchResults(data);
  } catch (error) {
    console.error('Error making Brave API request:', error);
    throw error;
  }
}

export async function searchLearningResources(query: string): Promise<AdaptedSearchResponse> {
  console.log('Searching for learning resources:', query);
  return makeRequest(`${query} tutorials courses learning resources`);
}

export async function searchCertifications(skill: string): Promise<AdaptedSearchResponse> {
  console.log('Searching for certifications:', skill);
  return makeRequest(`${skill} professional certification programs`);
}

export async function searchMarketData(role: string): Promise<AdaptedSearchResponse> {
  console.log('Searching for market data:', role);
  
  try {
    // Using a simple, focused query
    const query = `${role} salary range skills requirements job market 2024`;
    const data = await makeRequest(query);

    // Return results
    return {
      results: data.results.slice(0, 15), // Limit to top 15 results
      query: role,
      status: 'success'
    };
  } catch (error) {
    console.error('Error in searchMarketData:', error);
    throw error;
  }
}
