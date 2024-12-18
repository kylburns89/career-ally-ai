import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        // Use localStorage instead of sessionStorage to persist session across browser restarts
        storage: {
          getItem: (key) => localStorage.getItem(key),
          setItem: (key, value) => localStorage.setItem(key, value),
          removeItem: (key) => {
            localStorage.removeItem(key)
            // Also remove from sessionStorage to ensure complete cleanup
            sessionStorage.removeItem(key)
          }
        }
      }
    }
  )
}
