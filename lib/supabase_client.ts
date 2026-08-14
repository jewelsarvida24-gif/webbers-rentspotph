import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!url || !key) {
    // If env vars are missing, return a minimal stub client so the UI can render in dev.
    // Methods return harmless defaults; real Supabase features will be disabled.
    // eslint-disable-next-line no-console
    console.warn('Supabase env variables missing; using stub client.');
    const stub = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: null, error: null }),
      },
      from: () => ({
        select: async () => ({ data: null, error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        eq: function () { return this; },
        single: async () => ({ data: null, error: null }),
      }),
      // minimal storage stub
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: null }),
          download: async () => ({ data: null, error: null }),
        }),
      },
    } as any;
    return stub;
  }

  return createBrowserClient(url, key);
}
