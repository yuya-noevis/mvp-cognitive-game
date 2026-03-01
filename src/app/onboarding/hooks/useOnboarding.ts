'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { generateAnonChildId } from '@/lib/utils';
import { setLocalChildProfile, setLocalConsents, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';
import {
  determineTier,
  deriveDiagnosisLevel,
  deriveLanguageUnderstanding,
  saveTier,
} from '@/features/gating';
import { deriveDisabilityType } from '@/features/dda/derive-profile';
import { saveDisabilityType } from '@/features/dda/disability-profile-store';
import type { AgeGroup } from '@/types';
import type { OnboardingDataV2, YesNoAnswer } from '../types';
import { SCREENS, TOTAL_STEPS } from '../constants';
import {
  saveToSession,
  loadFromSession,
  clearSession,
  defaultData,
  birthDateToAge,
  ageToAgeGroup,
  estimateInitialLevel,
  buildSupportNeeds,
} from '../lib/save';

export function useOnboarding() {
  const router = useRouter();
  const [screenIdx, setScreenIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [data, setData] = useState<OnboardingDataV2>(defaultData);

  // Compute visible screens based on conditions
  const visibleScreens = useMemo(() => {
    return SCREENS.filter((s) => !s.condition || s.condition(data));
  }, [data]);

  const currentScreen = visibleScreens[screenIdx] || visibleScreens[0];

  // Progress based on screen id out of 25 total
  const progress = currentScreen ? (currentScreen.id + 1) / TOTAL_STEPS : 0;

  // Restore from session
  useEffect(() => {
    const saved = loadFromSession();
    if (saved) {
      setData(saved.data);
      setScreenIdx(saved.screenIdx);
    }
    setInitialized(true);
  }, []);

  // Persist to session
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!initialized) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToSession(screenIdx, data), 300);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [screenIdx, data, initialized]);

  const goForward = useCallback(() => {
    setDirection(1);
    setScreenIdx((i) => Math.min(i + 1, visibleScreens.length - 1));
  }, [visibleScreens.length]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setScreenIdx((i) => Math.max(i - 1, 0));
  }, []);

  // Yes/No/Unknown answer handler — auto-advance after 300ms
  const handleYesNo = useCallback((answer: YesNoAnswer) => {
    const screen = currentScreen;
    if (!screen) return;

    if (screen.domain) {
      setData((prev) => ({
        ...prev,
        domainAnswers: { ...prev.domainAnswers, [screen.domain!]: answer },
        ...(screen.dataKey === 'q_sensory_sensitive' ? { sensorySensitive: answer } : {}),
      }));
    } else if (screen.dataKey === 'hasEvaluation') {
      setData((prev) => ({ ...prev, hasEvaluation: answer }));
    }

    setTimeout(() => goForward(), 300);
  }, [currentScreen, goForward]);

  // Single select handler
  const handleSingleSelect = useCallback((value: string) => {
    const screen = currentScreen;
    if (!screen) return;

    if (screen.dataKey === 'speechLevel') {
      setData((prev) => ({ ...prev, speechLevel: value as OnboardingDataV2['speechLevel'] }));
    }
  }, [currentScreen]);

  // Multi chip toggle handler
  const handleChipToggle = useCallback((value: string) => {
    const screen = currentScreen;
    if (!screen) return;
    const key = screen.dataKey as 'disabilities' | 'concerns' | 'behavioralTraits' | 'socialTraits';

    setData((prev) => {
      const current = prev[key] as string[];
      if (value === 'none' || value === 'concern_none') {
        return { ...prev, [key]: current.includes(value) ? [] : [value] };
      }
      const withoutNone = current.filter((v) => v !== 'none' && v !== 'concern_none');
      if (withoutNone.includes(value)) {
        return { ...prev, [key]: withoutNone.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...withoutNone, value] };
    });
  }, [currentScreen]);

  // Account creation
  const handleAccountNext = useCallback(async () => {
    setAuthError('');
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
      if (isSupabaseEnabled) {
        try {
          const { error } = await supabase.auth.signUp({ email: data.email, password: data.password });
          if (error) console.warn('Supabase signUp failed, continuing without auth:', error.message);
          else {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
            if (signInError) console.warn('Auto sign-in failed:', signInError.message);
          }
        } catch (e) {
          console.warn('Account creation failed, continuing without auth:', e);
        }
      }
      goForward();
    } finally {
      setSaving(false);
    }
  }, [data.email, data.password, goForward]);

  // localStorage fallback save helper
  const saveLocallyAndRedirect = useCallback((ageGroup: AgeGroup) => {
    const anonChildId = generateAnonChildId();
    const localId = `local_${anonChildId}`;
    const consentDefaults = { data_optimization: false, research_use: false, biometric: false };
    const settings: Record<string, unknown> = {};
    if (data.sensorySensitive === 'yes') {
      settings.flash_disabled = true;
      settings.animation_speed = 'slow';
    }
    setLocalChildProfile({
      id: localId,
      anonChildId,
      displayName: data.childName || 'おともだち',
      ageGroup,
      avatarId: 'avatar_01',
      settings,
      consentFlags: consentDefaults,
    });
    setLocalConsents(consentDefaults);
    document.cookie = 'manas_demo_session=1; path=/; max-age=2592000; SameSite=Lax';
    clearChildCache();
    clearSession();
    router.push('/');
  }, [data.childName, data.sensorySensitive, router]);

  // Final save
  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      const age = birthDateToAge(data.birthYear, data.birthMonth, data.birthDay);
      const ageGroup = ageToAgeGroup(age);

      // ティア判定（デモ・Supabase共通）
      const tier = determineTier({
        age,
        diagnosisLevel: deriveDiagnosisLevel(data.disabilities),
        languageUnderstanding: deriveLanguageUnderstanding(data.speechLevel),
      });
      saveTier(tier);

      // DDAプロファイル用の障害タイプを保存
      const disabilityType = deriveDisabilityType(data.disabilities);
      saveDisabilityType(disabilityType);

      if (!isSupabaseEnabled) {
        saveLocallyAndRedirect(ageGroup);
        return;
      }

      // Try Supabase path, fall back to localStorage on any failure
      try {
        let { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          const { error: reSignInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
          if (reSignInError) throw new Error('auth_failed');
          const { data: retryData } = await supabase.auth.getUser();
          userData = retryData;
          if (!userData.user) throw new Error('auth_failed');
        }

        const anonChildId = generateAnonChildId();
        const supportNeeds = buildSupportNeeds(data);

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
            support_needs: supportNeeds,
          })
          .select('id')
          .single();

        if (childError) throw new Error(`insert_failed: ${childError.message}`);

        // localStorage にもバックアップ保存
        setLocalChildProfile({
          id: childRow?.id ?? `local_${anonChildId}`,
          anonChildId,
          displayName: data.childName || 'おともだち',
          ageGroup,
          avatarId: 'avatar_01',
          settings: {},
          consentFlags: { data_optimization: false, research_use: false, biometric: false },
        });

        if (childRow) {
          await supabase.from('child_profiles').insert({
            child_id: childRow.id,
            speech_level: data.speechLevel,
            disability_types: data.disabilities,
            concerns: data.concerns,
            traits: [...data.behavioralTraits, ...data.socialTraits],
            domain_answers: data.domainAnswers,
          }); // non-critical, ignore errors

          const domainLevels = Object.entries(data.domainAnswers).map(([domain, answer]) => ({
            child_id: childRow.id,
            domain,
            current_level: estimateInitialLevel(answer),
          }));
          if (domainLevels.length > 0) {
            await supabase.from('domain_progress').upsert(domainLevels, { onConflict: 'child_id,domain' });
          }
        }

        clearChildCache();
        clearSession();
        router.push('/');
      } catch (e) {
        // Supabase failed — fall back to localStorage
        console.warn('Supabase save failed, falling back to localStorage:', e);
        saveLocallyAndRedirect(ageGroup);
      }
    } catch {
      setAuthError('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  }, [data, router, saveLocallyAndRedirect]);

  const handleDebugReset = useCallback(() => {
    clearSession();
    document.cookie = 'manas_demo_session=; path=/; max-age=0';
    clearLocalProfile();
    clearChildCache();
    setData(defaultData());
    setScreenIdx(0);
    setAuthError('');
    setSaving(false);
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const updateData = useCallback((partial: Partial<OnboardingDataV2>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const showBackButton = screenIdx > 0;

  return {
    screenIdx,
    direction,
    authError,
    saving,
    showPassword,
    initialized,
    data,
    currentScreen,
    progress,
    showBackButton,
    goForward,
    goBack,
    handleYesNo,
    handleSingleSelect,
    handleChipToggle,
    handleAccountNext,
    handleFinish,
    handleDebugReset,
    togglePassword,
    updateData,
  };
}
