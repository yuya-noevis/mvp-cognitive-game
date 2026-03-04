'use client';

import { useState, useEffect } from 'react';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import type { AgeGroup } from '@/types';
import { getLocalChildProfile, setLocalChildProfile, type LocalChildProfile } from '@/lib/local-profile';

export interface ChildProfile {
  id: string;
  anonChildId: string;
  displayName: string;
  ageGroup: AgeGroup;
  avatarId: string;
  settings: Record<string, unknown>;
  consentFlags: Record<string, boolean>;
}

interface UseChildProfileResult {
  child: ChildProfile | null;
  loading: boolean;
  error: string | null;
}

function localToProfile(local: LocalChildProfile): ChildProfile {
  return {
    id: local.id,
    anonChildId: local.anonChildId,
    displayName: local.displayName,
    ageGroup: local.ageGroup,
    avatarId: local.avatarId || 'avatar_01',
    settings: local.settings || {},
    consentFlags: local.consentFlags || {},
  };
}

let cachedChild: ChildProfile | null = null;

export function clearChildCache() {
  cachedChild = null;
}

export function useChildProfile(): UseChildProfileResult {
  // Synchronous hydration: cachedChild -> localStorage -> null
  // This ensures displayName is available on first render (no flash of fallback)
  const initialChild = cachedChild ?? (() => {
    const local = getLocalChildProfile();
    if (local) {
      const profile = localToProfile(local);
      cachedChild = profile;
      return profile;
    }
    return null;
  })();

  const [child, setChild] = useState<ChildProfile | null>(initialChild);
  // In Supabase mode, always start loading=true to ensure we verify with Supabase
  // before showing any fallback name. In local mode, trust localStorage.
  const [loading, setLoading] = useState(
    isSupabaseEnabled ? !initialChild : !initialChild
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedChild && child) {
      if (!isSupabaseEnabled) {
        setLoading(false);
        return;
      }
      // Fall through to fetchChild to refresh from Supabase
    }

    let cancelled = false;

    async function fetchChild() {
      try {
        // Local/demo mode
        if (!isSupabaseEnabled) {
          const local = getLocalChildProfile();
          if (!local) {
            setError('Child profile not found');
            return;
          }
          const profile = localToProfile(local);
          cachedChild = profile;
          if (!cancelled) setChild(profile);
          return;
        }

        // Supabase mode — try localStorage as instant fallback
        const local = getLocalChildProfile();

        // Retry getUser up to 2 times (auth session may not be immediately
        // available after signInWithPassword + router.push)
        let user = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            user = userData.user;
            break;
          }
          // First attempt failed — wait and retry
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 500));
          }
        }

        if (!user) {
          // Auth definitively failed — use localStorage if available
          if (local) {
            const profile = localToProfile(local);
            cachedChild = profile;
            if (!cancelled) setChild(profile);
            return;
          }
          if (!cancelled) {
            setError('Not authenticated');
            setLoading(false);
          }
          return;
        }

        // Use .limit(1) instead of .single() to avoid PGRST116 error on 0 rows
        const { data: rows, error: fetchError } = await supabase
          .from('children')
          .select('id, anon_child_id, display_name, age_group, settings, consent_flags')
          .eq('parent_user_id', user.id)
          .limit(1);

        if (fetchError || !rows || rows.length === 0) {
          // Supabase fetch failed — try localStorage fallback
          if (local) {
            const profile = localToProfile(local);
            cachedChild = profile;
            if (!cancelled) setChild(profile);
            return;
          }
          if (!cancelled) {
            setError('Child profile not found');
            setLoading(false);
          }
          return;
        }

        const data = rows[0];
        const profile: ChildProfile = {
          id: data.id,
          anonChildId: data.anon_child_id,
          displayName: data.display_name,
          ageGroup: data.age_group as AgeGroup,
          avatarId: 'avatar_01',
          settings: data.settings || {},
          consentFlags: data.consent_flags || {},
        };

        // Cache to localStorage for resilience
        setLocalChildProfile({
          id: profile.id,
          anonChildId: profile.anonChildId,
          displayName: profile.displayName,
          ageGroup: profile.ageGroup,
          avatarId: profile.avatarId,
          settings: profile.settings,
          consentFlags: profile.consentFlags as Record<string, boolean>,
        });

        cachedChild = profile;
        if (!cancelled) setChild(profile);
      } catch (e) {
        console.warn('[useChildProfile] fetch error:', e);
        // Network error — try localStorage fallback
        const local = getLocalChildProfile();
        if (local) {
          const profile = localToProfile(local);
          cachedChild = profile;
          if (!cancelled) setChild(profile);
          return;
        }
        if (!cancelled) setError('Failed to fetch child profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChild();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { child, loading, error };
}
