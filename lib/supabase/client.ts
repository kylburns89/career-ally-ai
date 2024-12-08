import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function handleErrorResponse(error: any, defaultMessage: string = "An error occurred") {
  console.error(error);
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}
