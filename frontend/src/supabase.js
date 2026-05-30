import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Polyfill for browsers that partially implement LockManager (returns null)
if (typeof navigator !== 'undefined' && navigator.locks) {
  const _request = navigator.locks.request.bind(navigator.locks);
  navigator.locks.request = (name, optionsOrCallback, callback) => {
    try {
      return _request(name, optionsOrCallback, callback);
    } catch {
      const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
      return Promise.resolve(cb({ name, mode: 'exclusive' }));
    }
  };
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
