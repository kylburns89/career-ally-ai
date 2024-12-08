import { NextResponse } from 'next/server';
import { getMarketAnalysis } from '@/lib/perplexity';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  if (!role) {
    return NextResponse.json(
      { error: 'Role parameter is required' },
      { status: 400 }
    );
  }

  try {
    const marketData = await getMarketAnalysis(role);
    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market analysis' },
      { status: 500 }
    );
  }
}
