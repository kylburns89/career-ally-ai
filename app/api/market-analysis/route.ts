import { NextResponse } from 'next/server';
import { searchMarketData } from '../../../lib/brave';
import { generateMarketAnalysis } from '../../../lib/together';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const dynamic = 'force-dynamic';

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
    // Create a Supabase client for the route handler with cookie support
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // Support OAuth flows
              sameSite: 'lax',
              // Set path to root
              path: '/',
            });
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First, search for relevant market data using Brave Search
    const searchResults = await searchMarketData(role);
    console.log('Brave search results:', searchResults);

    if (!searchResults.results || searchResults.results.length === 0) {
      return NextResponse.json(
        { error: 'No search results found' },
        { status: 404 }
      );
    }

    // Then, use Together AI to analyze the data and generate structured response
    const analysisResponse = await generateMarketAnalysis(role, searchResults.results);
    
    // Create a new response with our headers
    const { readable, writable } = new TransformStream();
    analysisResponse.body?.pipeTo(writable);
    
    const response = new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

    return response;
  } catch (error) {
    console.error('Market analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market analysis';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
