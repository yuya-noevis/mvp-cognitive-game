import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

function createDisabledClient(): SupabaseClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase is disabled (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). ' +
            'Run in local/demo mode or provide env vars.'
        );
      },
    }
  ) as unknown as SupabaseClient;
}

// createBrowserClient はセッションを cookies に保存するため、
// ミドルウェアが認証状態を正しく検知できる
export const supabase: SupabaseClient = isSupabaseEnabled
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : createDisabledClient();
