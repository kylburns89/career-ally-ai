import { NextResponse } from 'next/server';
import { searchMarketData } from '../../../lib/brave';
import { generateMarketAnalysis } from '../../../lib/together';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }

    // Get the session using NextAuth
    const session = await getServerSession(authOptions);

    // Temporarily disable auth check for debugging
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    // First, search for relevant market data using Brave Search
    const searchResults = await searchMarketData(role);
    console.log('Role:', role);
    console.log('Brave search results:', JSON.stringify(searchResults, null, 2));

    if (!searchResults.results || searchResults.results.length === 0) {
      return NextResponse.json(
        { error: 'No search results found' },
        { status: 404 }
      );
    }

    // Then, use Together AI to analyze the data and generate structured response
    try {
      const analysisResponse = await generateMarketAnalysis(role, searchResults.results);
      console.log('Analysis response:', JSON.stringify(analysisResponse, null, 2));
      
      // Return the analysis response directly
      return NextResponse.json(analysisResponse);
    } catch (error) {
      console.error('Generate market analysis error:', error);
      return NextResponse.json(
        { error: 'Failed to generate market analysis' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Market analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market analysis';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
