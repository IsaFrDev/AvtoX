import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Replace navigator.locks with a reliable implementation.
// Some browsers have the API but return null locks (violating the spec),
// which causes Supabase GoTrue to log warnings and potentially retry loops.
if (typeof navigator !== 'undefined') {
  const safeLocks = {
    request: (_name, optOrCb, cb) => {
      const fn = typeof optOrCb === 'function' ? optOrCb : cb;
      return Promise.resolve(fn({ name: _name, mode: 'exclusive' }));
    },
    query: () => Promise.resolve({ held: [], pending: [] }),
  };
  try {
    Object.defineProperty(navigator, 'locks', { get: () => safeLocks, configurable: true });
  } catch {
    // If defineProperty fails, leave navigator.locks as-is
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'avto-x-auth-token',
    storage: window.localStorage,
  },
});

export default supabase;
