import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createSupabaseClient = () =>
  createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )

// Error handling utilities
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('auth')) {
      throw new AuthError(error.message)
    }
    if (error.message.includes('database') || error.message.includes('relation')) {
      throw new DatabaseError(error.message)
    }
  }
  throw error
}

// Type guards
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && error.name === 'AuthError'
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof Error && error.name === 'DatabaseError'
}

// Response helpers
export function handleErrorResponse(error: unknown) {
  console.error('Error:', error)
  
  if (isAuthError(error)) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  if (isDatabaseError(error)) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  return new Response(JSON.stringify({ message: 'Internal server error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
