'use client';

import { useState, useEffect } from 'react';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import type { AgeGroup } from '@/types';
import { getLocalChildProfile } from '@/lib/local-profile';

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

let cachedChild: ChildProfile | null = null;

export function clearChildCache() {
  cachedChild = null;
}

export function useChildProfile(): UseChildProfileResult {
  const [child, setChild] = useState<ChildProfile | null>(cachedChild);
  const [loading, setLoading] = useState(!cachedChild);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedChild) {
      // Ensure state is synced with cache
      setChild(cachedChild);
      setLoading(false);
      return;
    }

    async function fetchChild() {
      try {
        // Local/demo mode
        if (!isSupabaseEnabled) {
          const local = getLocalChildProfile();
          if (!local) {
            setError('Child profile not found');
            return;
          }
          const profile: ChildProfile = {
            id: local.id,
            anonChildId: local.anonChildId,
            displayName: local.displayName,
            ageGroup: local.ageGroup,
            avatarId: local.avatarId || 'avatar_01',
            settings: local.settings || {},
            consentFlags: local.consentFlags || {},
          };
          cachedChild = profile;
          setChild(profile);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('children')
          .select('id, anon_child_id, display_name, age_group, avatar_id, settings, consent_flags')
          .eq('parent_user_id', userData.user.id)
          .single();

        if (fetchError || !data) {
          setError('Child profile not found');
          setLoading(false);
          return;
        }

        const profile: ChildProfile = {
          id: data.id,
          anonChildId: data.anon_child_id,
          displayName: data.display_name,
          ageGroup: data.age_group as AgeGroup,
          avatarId: data.avatar_id || 'avatar_01',
          settings: data.settings || {},
          consentFlags: data.consent_flags || {},
        };

        cachedChild = profile;
        setChild(profile);
      } catch {
        setError('Failed to fetch child profile');
      } finally {
        setLoading(false);
      }
    }

    fetchChild();
  }, []);

  return { child, loading, error };
}
