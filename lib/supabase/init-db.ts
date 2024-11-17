import { createClient } from '@supabase/supabase-js'

/**
 * This script initializes the database schema in Supabase.
 * To use:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to SQL Editor
 * 3. Create a new query
 * 4. Copy the contents of supabase/migrations/20240101000000_initial_schema.sql
 * 5. Run the query to create all tables and set up RLS policies
 * 
 * Note: This is a one-time setup that should be run when first deploying the application
 * or when making schema changes. Always backup your database before running migrations.
 */

export async function initializeDatabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Verify database connection
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Database connection error:', error)
    throw error
  }

  console.log('Database connection successful')
  return true
}

// Helper function to check if a table exists
export async function checkTableExists(tableName: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (error) {
    if (error.code === '42P01') { // PostgreSQL error code for undefined_table
      return false
    }
    throw error
  }

  return true
}

// Helper function to verify all required tables exist
export async function verifyDatabaseSchema() {
  const requiredTables = [
    'profiles',
    'resumes',
    'cover_letters',
    'applications',
    'chat_histories'
  ]

  for (const table of requiredTables) {
    const exists = await checkTableExists(table)
    if (!exists) {
      throw new Error(`Required table '${table}' does not exist. Please run the database migrations.`)
    }
  }

  console.log('All required tables exist')
  return true
}

/**
 * Instructions for setting up the database:
 * 
 * 1. Create a new Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Project Settings -> API
 * 3. Add these values to your .env file:
 *    NEXT_PUBLIC_SUPABASE_URL=your_project_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * 4. Go to the SQL Editor in your Supabase dashboard
 * 5. Create a new query
 * 6. Copy the contents of supabase/migrations/20240101000000_initial_schema.sql
 * 7. Run the query to create all tables and set up RLS policies
 * 8. Run the verifyDatabaseSchema function to confirm setup
 * 
 * Note: Always backup your database before running migrations
 */
