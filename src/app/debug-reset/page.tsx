'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { clearChildCache } from '@/hooks/useChildProfile';
import { clearLocalProfile } from '@/lib/local-profile';

export default function DebugResetPage() {
  useEffect(() => {
    async function reset() {
      clearChildCache();
      clearLocalProfile();
      document.cookie = 'manas_demo_session=; path=/; max-age=0';
      try { sessionStorage.clear(); } catch {}
      try {
        localStorage.removeItem('manas_tier');
        localStorage.removeItem('manas_disability_type');
      } catch {}
      try { await supabase.auth.signOut(); } catch {}
      window.location.href = '/onboarding';
    }
    reset();
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-deep-space">
      <p className="text-stardust text-lg">リセット中...</p>
    </div>
  );
}
