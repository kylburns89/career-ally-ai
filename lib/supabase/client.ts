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
        storageKey: 'sb-auth-token', // Explicitly set storage key for better control
        storage: {
          // Use sessionStorage instead of localStorage for better security
          // This ensures tokens are cleared when the browser is closed
          getItem: (key) => sessionStorage.getItem(key),
          setItem: (key, value) => sessionStorage.setItem(key, value),
          removeItem: (key) => {
            sessionStorage.removeItem(key)
            // Also remove from localStorage to ensure complete cleanup
            localStorage.removeItem(key)
          }
        }
      }
    }
  )
}
