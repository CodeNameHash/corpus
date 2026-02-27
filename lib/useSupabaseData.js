// lib/useSupabaseData.js
// Shared hook: tries Supabase first, falls back to static data.
// Usage: const { data, loading } = useSupabaseData(fetcher, staticFallback, deps)

import { useState, useEffect } from 'react';

const HAS_SUPABASE = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

export function useSupabaseData(fetcher, staticFallback, deps = []) {
  const [data, setData] = useState(staticFallback);
  const [loading, setLoading] = useState(HAS_SUPABASE);

  useEffect(() => {
    if (!HAS_SUPABASE) { setData(staticFallback); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { supabase } = await import('./supabase');
        const result = await fetcher(supabase);
        if (!cancelled && result != null) setData(result);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, deps);

  return { data, loading };
}

export { HAS_SUPABASE };
