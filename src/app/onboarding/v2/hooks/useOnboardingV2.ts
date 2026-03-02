'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AgeGroup } from '@/types';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { generateAnonChildId } from '@/lib/utils';
import { setLocalChildProfile, setLocalConsents, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';
import { determineTier, saveTier, deriveDiagnosisLevel, deriveLanguageUnderstanding } from '@/features/gating';
import type { OnboardingV2State, OnboardingV2Data } from '../types';
import { saveV2State, loadV2State, clearV2State, defaultV2Data } from '../lib/storage';
import { birthDateToAge, ageToAgeGroup } from '../../lib/save';

export function useOnboardingV2() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingV2State>(defaultV2Data());
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);

  // Restore session
  useEffect(() => {
    const saved = loadV2State();
    if (saved) {
      setState(saved);
    }
    setInitialized(true);
  }, []);

  // Persist to session (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!initialized) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveV2State(state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, initialized]);

  const updateData = useCallback((partial: Partial<OnboardingV2Data>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...partial },
    }));
  }, []);

  // Phase 1 navigation
  const goToNextPhase1Screen = useCallback(() => {
    setDirection(1);
    setState((prev) => {
      if (prev.phase1ScreenIndex < 2) {
        return { ...prev, phase1ScreenIndex: prev.phase1ScreenIndex + 1 };
      }
      // All 3 screens complete — derive ageGroup and move to phase 2
      const age = birthDateToAge(prev.data.birthYear, prev.data.birthMonth, prev.data.birthDay);
      const ageGroup = ageToAgeGroup(age) as AgeGroup;
      return {
        ...prev,
        phase: 'phase2_game',
        data: { ...prev.data, ageGroup, phase1Complete: true },
      };
    });
  }, []);

  const goToPrevPhase1Screen = useCallback(() => {
    setDirection(-1);
    setState((prev) => {
      if (prev.phase1ScreenIndex > 0) {
        return { ...prev, phase1ScreenIndex: prev.phase1ScreenIndex - 1 };
      }
      return prev;
    });
  }, []);

  // Phase 2 complete (game demo done)
  const handlePhase2Complete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'phase3_signup',
      data: { ...prev.data, phase2Complete: true },
    }));
  }, []);

  // Skip signup — create local anonymous session and go home
  const handleSkipSignup = useCallback(() => {
    const { data } = state;
    const ageGroup = data.ageGroup ?? '6-9';

    const tier = determineTier({
      age: birthDateToAge(data.birthYear, data.birthMonth, data.birthDay),
      diagnosisLevel: deriveDiagnosisLevel([]),
      languageUnderstanding: deriveLanguageUnderstanding(data.speechLevel),
    });
    saveTier(tier);

    const anonChildId = generateAnonChildId();
    const localId = `local_${anonChildId}`;
    setLocalChildProfile({
      id: localId,
      anonChildId,
      displayName: data.childName || 'おともだち',
      ageGroup,
      avatarId: 'avatar_01',
      settings: {},
      consentFlags: { data_optimization: false, research_use: false, biometric: false },
    });
    setLocalConsents({ data_optimization: false, research_use: false, biometric: false });
    document.cookie = 'manas_demo_session=1; path=/; max-age=2592000; SameSite=Lax';
    clearChildCache();
    clearV2State();
    router.push('/');
  }, [state, router]);

  // Signup — create Supabase account (or fall back to local) and save data
  const handleSignup = useCallback(async () => {
    setAuthError('');
    const { data } = state;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setAuthError('有効なメールアドレスを入力してください');
      return;
    }
    if (data.password.length < 8) {
      setAuthError('パスワードは8文字以上で入力してください');
      return;
    }

    setSaving(true);
    try {
      const ageGroup = data.ageGroup ?? '6-9';
      const age = birthDateToAge(data.birthYear, data.birthMonth, data.birthDay);
      const tier = determineTier({
        age,
        diagnosisLevel: deriveDiagnosisLevel([]),
        languageUnderstanding: deriveLanguageUnderstanding(data.speechLevel),
      });
      saveTier(tier);

      if (!isSupabaseEnabled) {
        // Demo mode fallback
        const anonChildId = generateAnonChildId();
        const localId = `local_${anonChildId}`;
        setLocalChildProfile({
          id: localId,
          anonChildId,
          displayName: data.childName || 'おともだち',
          ageGroup,
          avatarId: 'avatar_01',
          settings: {},
          consentFlags: { data_optimization: false, research_use: false, biometric: false },
        });
        setLocalConsents({ data_optimization: false, research_use: false, biometric: false });
        document.cookie = 'manas_demo_session=1; path=/; max-age=2592000; SameSite=Lax';
        clearChildCache();
        clearV2State();
        router.push('/');
        return;
      }

      // Supabase path
      try {
        const { error: signUpError } = await supabase.auth.signUp({ email: data.email, password: data.password });
        if (signUpError) {
          setAuthError('アカウント作成に失敗しました: ' + signUpError.message);
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
        if (signInError) {
          setAuthError('サインインに失敗しました');
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setAuthError('ユーザー情報の取得に失敗しました');
          return;
        }

        const anonChildId = generateAnonChildId();
        const { data: childRow, error: childError } = await supabase
          .from('children')
          .insert({
            anon_child_id: anonChildId,
            parent_user_id: userData.user.id,
            display_name: data.childName || 'おともだち',
            name: data.childName || 'おともだち',
            age_group: ageGroup,
            avatar_id: 'avatar_01',
            parent_role: 'parent',
            is_onboarded: true,
            consent_flags: { data_optimization: false, research_use: false, biometric: false },
            support_needs: '',
          })
          .select('id')
          .single();

        if (childError) {
          console.warn('Child insert failed, falling back to local:', childError.message);
          // Fall back to local
          const localId = `local_${anonChildId}`;
          setLocalChildProfile({
            id: localId,
            anonChildId,
            displayName: data.childName || 'おともだち',
            ageGroup,
            avatarId: 'avatar_01',
            settings: {},
            consentFlags: { data_optimization: false, research_use: false, biometric: false },
          });
        } else {
          // Save backup to localStorage
          setLocalChildProfile({
            id: childRow?.id ?? `local_${anonChildId}`,
            anonChildId,
            displayName: data.childName || 'おともだち',
            ageGroup,
            avatarId: 'avatar_01',
            settings: {},
            consentFlags: { data_optimization: false, research_use: false, biometric: false },
          });

          // Save minimal child_profiles (non-critical)
          if (childRow) {
            try {
              await supabase.from('child_profiles').insert({
                child_id: childRow.id,
                speech_level: data.speechLevel,
                disability_types: [],
                concerns: [],
                traits: [],
                domain_answers: {},
              });
            } catch {
              // non-critical
            }
          }
        }

        clearChildCache();
        clearV2State();
        router.push('/');
      } catch (e) {
        console.warn('Supabase signup failed, falling back to local:', e);
        // Full fallback
        const anonChildId = generateAnonChildId();
        setLocalChildProfile({
          id: `local_${anonChildId}`,
          anonChildId,
          displayName: data.childName || 'おともだち',
          ageGroup,
          avatarId: 'avatar_01',
          settings: {},
          consentFlags: { data_optimization: false, research_use: false, biometric: false },
        });
        setLocalConsents({ data_optimization: false, research_use: false, biometric: false });
        document.cookie = 'manas_demo_session=1; path=/; max-age=2592000; SameSite=Lax';
        clearChildCache();
        clearV2State();
        router.push('/');
      }
    } catch {
      setAuthError('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  }, [state, router]);

  const handleDebugReset = useCallback(() => {
    clearV2State();
    document.cookie = 'manas_demo_session=; path=/; max-age=0';
    clearLocalProfile();
    clearChildCache();
    setState(defaultV2Data());
    setAuthError('');
  }, []);

  const progress = (() => {
    if (state.phase === 'phase1_info') {
      return (state.phase1ScreenIndex + 1) / 3;
    }
    return 1;
  })();

  const showBackButton =
    state.phase === 'phase1_info' && state.phase1ScreenIndex > 0;

  return {
    state,
    initialized,
    authError,
    saving,
    direction,
    progress,
    showBackButton,
    updateData,
    goToNextPhase1Screen,
    goToPrevPhase1Screen,
    handlePhase2Complete,
    handleSkipSignup,
    handleSignup,
    handleDebugReset,
  };
}
