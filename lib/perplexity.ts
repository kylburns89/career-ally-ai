import { PerplexityResponse, MarketAnalysis } from '@/types/perplexity';

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('Missing PERPLEXITY_API_KEY environment variable');
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

function cleanJsonString(str: string): string {
  // Remove any markdown code block syntax
  str = str.replace(/```json\n?|\n?```/g, '');
  // Remove any explanatory text before or after the JSON
  const jsonStart = str.indexOf('{');
  const jsonEnd = str.lastIndexOf('}') + 1;
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    str = str.slice(jsonStart, jsonEnd);
  }
  return str;
}

export async function getMarketAnalysis(role: string): Promise<MarketAnalysis> {
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a market research expert. Return only valid JSON data matching the exact structure requested."
        },
        {
          role: "user",
          content: `Return a JSON object with comprehensive market analysis data for ${role} positions. Follow these rules:
1. Return ONLY the JSON object, no explanations or text
2. Use numbers for all numerical values, no strings
3. Salary values should be in USD without currency symbols
4. Work model values should be percentages as numbers
5. Growth rates and changes should be percentages as numbers
6. Exactly match this structure:
{
  "salary": {
    "min": 50000,
    "max": 150000,
    "average": 100000
  },
  "jobOpenings": 500,
  "workModel": {
    "remote": 30,
    "hybrid": 40,
    "onsite": 30
  },
  "trends": {
    "growthRate": 25,
    "yearOverYearChange": -5,
    "topSpecializations": [
      {
        "name": "AI Engineer",
        "growth": 80
      },
      {
        "name": "Machine Learning Engineer",
        "growth": 70
      },
      {
        "name": "Data Engineer",
        "growth": 15
      }
    ]
  },
  "industryDemand": [
    {
      "industry": "Finance",
      "demand": 25
    },
    {
      "industry": "Healthcare",
      "demand": 20
    },
    {
      "industry": "Manufacturing",
      "demand": 15
    }
  ],
  "geographicalHotspots": [
    {
      "city": "San Francisco",
      "jobShare": 15
    },
    {
      "city": "New York",
      "jobShare": 12
    },
    {
      "city": "Seattle",
      "jobShare": 10
    }
  ],
  "marketOutlook": {
    "projectedGrowth": 6.5,
    "keyTrends": [
      "Increased cloud computing demand",
      "Growth in AI/ML roles",
      "Rising demand in healthcare sector"
    ]
  }
}`
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent output
      top_p: 0.9
    })
  };

  try {
    const response = await fetch(PERPLEXITY_API_URL, options);
    
    if (!response.ok) {
      if (response.status === 422) {
        const error = await response.json();
        console.error('Validation error:', error);
        throw new Error(`Validation error: ${JSON.stringify(error)}`);
      }
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    console.log('Perplexity API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content in Perplexity response');
    }

    const content = data.choices[0].message.content;
    console.log('Raw content:', content);

    try {
      const cleanContent = cleanJsonString(content);
      console.log('Cleaned content:', cleanContent);
      
      const parsedData = JSON.parse(cleanContent) as MarketAnalysis;
      
      // Validate the response structure
      if (!parsedData.salary?.min || !parsedData.salary?.max || !parsedData.salary?.average || 
          typeof parsedData.jobOpenings !== 'number' || 
          typeof parsedData.workModel?.remote !== 'number' || 
          typeof parsedData.workModel?.hybrid !== 'number' || 
          typeof parsedData.workModel?.onsite !== 'number' ||
          !Array.isArray(parsedData.trends?.topSpecializations) ||
          !Array.isArray(parsedData.industryDemand) ||
          !Array.isArray(parsedData.geographicalHotspots) ||
          !Array.isArray(parsedData.marketOutlook?.keyTrends)) {
        console.error('Invalid data structure:', parsedData);
        throw new Error('Invalid response structure');
      }

      // Validate work model percentages sum to 100
      const totalPercentage = parsedData.workModel.remote + 
                            parsedData.workModel.hybrid + 
                            parsedData.workModel.onsite;
      if (Math.abs(totalPercentage - 100) > 1) { // Allow 1% margin of error
        console.error('Invalid percentages:', parsedData.workModel);
        throw new Error('Work model percentages do not sum to 100%');
      }

      return parsedData;
    } catch (error) {
      console.error('Parse error:', error);
      console.error('Failed content:', content);
      throw new Error('Failed to parse market analysis response');
    }
  } catch (error) {
    console.error('Market analysis error:', error);
    throw error;
  }
}
