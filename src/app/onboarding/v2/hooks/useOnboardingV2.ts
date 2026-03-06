'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AgeGroup } from '@/types';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { generateAnonChildId } from '@/lib/utils';
import { setLocalChildProfile, setLocalConsents, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';
import { determineTier, saveTier, deriveLanguageUnderstanding } from '@/features/gating';
import type { Tier } from '@/features/gating';
import { saveOnboardingProfile } from '@/features/onboarding-profile';
import { saveSensorySettings } from '@/features/sensory/storage';
import { useSensorySettings } from '@/features/sensory/SensorySettingsContext';
import type { SensorySettings } from '@/features/sensory/types';
import type { OnboardingV2State, OnboardingV2Data } from '../types';
import { saveV2State, loadV2State, clearV2State, defaultV2Data } from '../lib/storage';

const PHASE1_SCREEN_COUNT = 5; // age+name+honorific, speech, tablet, auditory, diagnosis

function ageToAgeGroupSafe(age: number | null): AgeGroup {
  if (!age) return '6-9';
  if (age <= 5) return '3-5';
  if (age <= 9) return '6-9';
  return '10-15';
}

function auditoryToSensoryDefaults(sensitivity: string): Partial<SensorySettings> {
  switch (sensitivity) {
    case 'severe':
      return { bgm: 'off', soundEffectVolume: 'off' };
    case 'mild':
      return { bgm: 'off', soundEffectVolume: 'low' };
    case 'none':
      return { bgm: 'on', soundEffectVolume: 'normal' };
    case 'enjoys':
      return { bgm: 'on', soundEffectVolume: 'high' };
    default:
      return {};
  }
}

export function useOnboardingV2() {
  const router = useRouter();
  const { updateSettings: updateSensorySettings } = useSensorySettings();
  const [state, setState] = useState<OnboardingV2State>(defaultV2Data());
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);
  const [computedTier, setComputedTier] = useState<Tier>(1);

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

  // Apply auditory sensitivity to sensory settings when Phase 1 completes
  useEffect(() => {
    if (state.data.phase1Complete && state.data.auditorySensitivity) {
      const sensoryDefaults = auditoryToSensoryDefaults(state.data.auditorySensitivity);
      const current: SensorySettings = {
        bgm: 'on',
        soundEffectVolume: 'normal',
        animationSpeed: 'normal',
        vibration: 'on',
        ...sensoryDefaults,
      };
      saveSensorySettings(current);
      updateSensorySettings(sensoryDefaults);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data.phase1Complete]);

  // Phase 1 navigation (5 screens)
  const goToNextPhase1Screen = useCallback(() => {
    setDirection(1);
    setState((prev) => {
      if (prev.phase1ScreenIndex < PHASE1_SCREEN_COUNT - 1) {
        return { ...prev, phase1ScreenIndex: prev.phase1ScreenIndex + 1 };
      }
      // All 5 screens complete -> move to Phase 2
      const ageGroup = ageToAgeGroupSafe(prev.data.age);
      return {
        ...prev,
        phase: 'phase2_assessment',
        phase2ScreenIndex: 0,
        data: {
          ...prev.data,
          ageGroup,
          phase1Complete: true,
        },
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

  // Phase 2 navigation: screen 0 = concerns, screens 1..N = severity per concern
  const phase2TotalScreens = useCallback((data: OnboardingV2Data) => {
    return 1 + data.concernTags.length; // concern selection + N severity screens
  }, []);

  const goToNextPhase2Screen = useCallback(() => {
    setDirection(1);
    setState((prev) => {
      const total = phase2TotalScreens(prev.data);
      if (prev.phase2ScreenIndex < total - 1) {
        return { ...prev, phase2ScreenIndex: prev.phase2ScreenIndex + 1 };
      }
      // Phase 2 complete -> move to Phase 3 (guidance first)
      return {
        ...prev,
        phase: 'phase3_calibration',
        phase3Step: 'guidance',
        data: { ...prev.data, phase2Complete: true },
      };
    });
  }, [phase2TotalScreens]);

  const goToPrevPhase2Screen = useCallback(() => {
    setDirection(-1);
    setState((prev) => {
      if (prev.phase2ScreenIndex > 0) {
        return { ...prev, phase2ScreenIndex: prev.phase2ScreenIndex - 1 };
      }
      // Go back to last Phase 1 screen
      return {
        ...prev,
        phase: 'phase1_info',
        phase1ScreenIndex: PHASE1_SCREEN_COUNT - 1,
      };
    });
  }, []);

  // Phase 3: guidance -> start calibration (mascot selection first)
  const handleGuidanceStart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase3Step: 'mascot',
    }));
  }, []);

  // Phase 3: skip calibration -> provisional Tier 1
  const handleCalibrationSkip = useCallback(() => {
    const tier: Tier = 1;
    setComputedTier(tier);
    setState((prev) => ({
      ...prev,
      phase3Step: 'goal',
      data: {
        ...prev.data,
        calibrationSkipped: true,
        calibrationResult: null,
        phase3Complete: true,
        dailyGoalMinutes: 10,
      },
    }));
  }, []);

  // Phase 3: mascot selection confirmed -> start calibration game
  const handleMascotConfirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase3Step: 'calibration',
    }));
  }, []);

  // Build tier input from current data
  const buildTierInput = useCallback((data: OnboardingV2Data) => {
    const age = data.age ?? 6;

    // Derive diagnosis level from diagnosis tags
    let diagnosisLevel: 'severe' | 'moderate' | 'mild' | 'none' = 'none';
    if (data.idSeverity === 'id_severe') diagnosisLevel = 'severe';
    else if (data.idSeverity === 'id_moderate') diagnosisLevel = 'moderate';
    else if (data.idSeverity === 'id_mild') diagnosisLevel = 'mild';
    else if (data.idSeverity === 'id_unknown' && data.diagnosisTags.includes('id')) diagnosisLevel = 'moderate';
    // down_syndrome maps to id_mild equivalent for Tier control
    if (data.diagnosisTags.includes('down_syndrome') && diagnosisLevel === 'none') diagnosisLevel = 'mild';

    return {
      age,
      diagnosisLevel,
      languageUnderstanding: deriveLanguageUnderstanding(data.speechLevel),
      tabletOperation: data.tabletOperation || undefined,
      calibrationResult: data.calibrationResult
        ? {
            simpleReactionSuccess: data.calibrationResult.touchSuccess,
            goNoGoSuccess: data.calibrationResult.goNoGoSuccess,
            shapeMatchSuccess: data.calibrationResult.shapeMatchAccuracy >= 0.5,
            shapeMatchAccuracy: data.calibrationResult.shapeMatchAccuracy,
            randomPressRate: 0,
          }
        : undefined,
    };
  }, []);

  // Phase 3: calibration game complete -> compute tier -> show goal setting
  const handleCalibrationComplete = useCallback((calibrationResult?: OnboardingV2Data['calibrationResult']) => {
    setState((prev) => {
      const updatedData = {
        ...prev.data,
        phase3Complete: true,
        calibrationResult: calibrationResult || null,
      };
      const tierInput = buildTierInput(updatedData);
      const tier = determineTier(tierInput);
      setComputedTier(tier);

      return {
        ...prev,
        phase3Step: 'goal',
        data: updatedData,
      };
    });
  }, [buildTierInput]);

  // Phase 3: goal setting complete -> move to signup
  const handleGoalComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'phase4_signup',
    }));
  }, []);

  // Save onboarding profile to localStorage + Supabase
  const saveProfile = useCallback(async (data: OnboardingV2Data, childId?: string) => {
    // Backward compat: first severity -> baseline
    const firstSeverity = data.concernSeverities[0];

    await saveOnboardingProfile({
      speech_level: data.speechLevel || 'single_word',
      tablet_operation: data.tabletOperation || 'independent',
      auditory_sensitivity: data.auditorySensitivity || 'none',
      honorific: data.honorific || 'kun',
      diagnosis_tags: data.diagnosisTags,
      id_severity: (data.idSeverity as 'id_mild' | 'id_moderate' | 'id_severe' | 'id_unknown') || null,
      concern_tags: data.concernTags,
      concern_severities: data.concernSeverities,
      baseline_category: firstSeverity?.category || data.baselineCategory,
      baseline_score: firstSeverity?.severity || data.baselineScore,
      baseline_date: new Date().toISOString().split('T')[0],
      selected_mascot: data.selectedMascot || 'luna',
      daily_goal_minutes: data.dailyGoalMinutes,
      calibration_skipped: data.calibrationSkipped,
      weekly_checkins: [],
      companion_mode: data.tabletOperation === 'not_yet' || data.tabletOperation === 'assisted',
      onboarding_completed: true,
      expectation_shown: false,
    }, childId);
  }, []);

  // Skip signup — create local anonymous session and go home
  const handleSkipSignup = useCallback(async () => {
    const { data } = state;
    const ageGroup = data.ageGroup ?? '6-9';
    const tierInput = buildTierInput(data);
    const tier = data.calibrationSkipped ? 1 : determineTier(tierInput);
    saveTier(tier);
    await saveProfile(data);

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
  }, [state, router, buildTierInput, saveProfile]);

  // Signup — create Supabase account and save data
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
      const tierInput = buildTierInput(data);
      const tier = data.calibrationSkipped ? 1 : determineTier(tierInput);
      saveTier(tier);
      // Save profile to localStorage first (childId added after Supabase child creation)
      await saveProfile(data);

      if (!isSupabaseEnabled) {
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

        const displayName = data.childName || 'おともだち';
        const anonChildId = generateAnonChildId();

        // Check if child already exists for this user (re-onboarding case)
        const { data: existingRows } = await supabase
          .from('children')
          .select('id')
          .eq('parent_user_id', userData.user.id)
          .limit(1);

        let childRow: { id: string } | null = null;
        let childError: { message: string } | null = null;

        if (existingRows && existingRows.length > 0) {
          // UPDATE existing child record
          const { error: updateErr } = await supabase
            .from('children')
            .update({
              display_name: displayName,
              name: displayName,
              age_group: ageGroup,
              is_onboarded: true,
            })
            .eq('id', existingRows[0].id);
          childRow = existingRows[0];
          childError = updateErr;
        } else {
          // INSERT new child record
          const { data: insertRow, error: insertErr } = await supabase
            .from('children')
            .insert({
              anon_child_id: anonChildId,
              parent_user_id: userData.user.id,
              display_name: displayName,
              name: displayName,
              age_group: ageGroup,
              avatar_id: 'avatar_01',
              parent_role: 'parent',
              is_onboarded: true,
              consent_flags: { data_optimization: false, research_use: false, biometric: false },
              support_needs: '',
            })
            .select('id')
            .single();
          childRow = insertRow;
          childError = insertErr;
        }

        if (childError) {
          console.warn('Child save failed, falling back to local:', childError.message);
          const localId = `local_${anonChildId}`;
          setLocalChildProfile({
            id: localId,
            anonChildId,
            displayName,
            ageGroup,
            avatarId: 'avatar_01',
            settings: {},
            consentFlags: { data_optimization: false, research_use: false, biometric: false },
          });
        } else {
          setLocalChildProfile({
            id: childRow?.id ?? `local_${anonChildId}`,
            anonChildId,
            displayName,
            ageGroup,
            avatarId: 'avatar_01',
            settings: {},
            consentFlags: { data_optimization: false, research_use: false, biometric: false },
          });

          // Save full onboarding profile to Supabase child_profiles
          if (childRow) {
            await saveProfile(data, childRow.id);
          }
        }

        clearChildCache();
        clearV2State();
        router.push('/');
      } catch (e) {
        console.warn('Supabase signup failed, falling back to local:', e);
        const fallbackAnonId = generateAnonChildId();
        setLocalChildProfile({
          id: `local_${fallbackAnonId}`,
          anonChildId: fallbackAnonId,
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
  }, [state, router, buildTierInput, saveProfile]);

  const handleDebugReset = useCallback(() => {
    clearV2State();
    document.cookie = 'manas_demo_session=; path=/; max-age=0';
    clearLocalProfile();
    clearChildCache();
    setState(defaultV2Data());
    setAuthError('');
  }, []);

  // Progress bar: Phase 1 (5 screens) + Phase 2 (1 concern selection + N severity)
  const phase2Screens = 1 + state.data.concernTags.length;
  const totalInfoScreens = PHASE1_SCREEN_COUNT + Math.max(phase2Screens, 1);

  const progress = (() => {
    if (state.phase === 'phase1_info') {
      return (state.phase1ScreenIndex + 1) / totalInfoScreens;
    }
    if (state.phase === 'phase2_assessment') {
      return (PHASE1_SCREEN_COUNT + state.phase2ScreenIndex + 1) / totalInfoScreens;
    }
    return 1;
  })();

  const currentScreenNumber = (() => {
    if (state.phase === 'phase1_info') return state.phase1ScreenIndex + 1;
    if (state.phase === 'phase2_assessment') return PHASE1_SCREEN_COUNT + state.phase2ScreenIndex + 1;
    return 0;
  })();

  const showProgressBar =
    state.phase === 'phase1_info' || state.phase === 'phase2_assessment';

  const showBackButton =
    (state.phase === 'phase1_info' && state.phase1ScreenIndex > 0) ||
    state.phase === 'phase2_assessment';

  const goBack = useCallback(() => {
    if (state.phase === 'phase2_assessment') {
      goToPrevPhase2Screen();
    } else {
      goToPrevPhase1Screen();
    }
  }, [state.phase, goToPrevPhase1Screen, goToPrevPhase2Screen]);

  return {
    state,
    initialized,
    authError,
    saving,
    direction,
    progress,
    currentScreenNumber,
    totalInfoScreens,
    showProgressBar,
    showBackButton,
    computedTier,
    updateData,
    goToNextPhase1Screen,
    goToPrevPhase1Screen,
    goToNextPhase2Screen,
    goToPrevPhase2Screen,
    goBack,
    handleGuidanceStart,
    handleCalibrationSkip,
    handleMascotConfirm,
    handleCalibrationComplete,
    handleGoalComplete,
    handleSkipSignup,
    handleSignup,
    handleDebugReset,
  };
}
