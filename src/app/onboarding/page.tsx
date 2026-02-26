'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import type { Expression } from '@/components/mascot/Mogura';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { useRouter } from 'next/navigation';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { generateAnonChildId } from '@/lib/utils';
import type { AgeGroup } from '@/types';
import { setLocalChildProfile, setLocalConsents, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';

/* ====== Types ====== */

type YesNoAnswer = 'yes' | 'no' | 'unknown';
type DomainAnswer = 'yes' | 'no' | 'unknown' | 'skipped';

interface OnboardingDataV2 {
  email: string;
  password: string;
  childAge: number;
  childName: string;
  speechLevel: 'nonverbal' | 'nonverbal_yesno' | 'single_words' | 'partial_verbal' | 'verbal';
  hasEvaluation: YesNoAnswer;
  disabilities: string[];
  concerns: string[];
  domainAnswers: Record<string, DomainAnswer>;
  behavioralTraits: string[];
  socialTraits: string[];
  sensorySensitive: DomainAnswer;
}

type ScreenType = 'account' | 'single_select' | 'text_input' | 'yes_no' | 'multi_chips' | 'complete';

type Phase = 'account' | 'preliminary' | 'disability' | 'cognitive' | 'social' | 'motor' | 'traits' | 'complete';

interface ScreenDef {
  id: number;
  type: ScreenType;
  phase: Phase;
  phaseLabel?: string;
  phaseColor?: string;
  expression: Expression;
  expressionSize: number;
  title: string;
  subtitle?: string;
  domain?: string;
  dataKey: string;
  skippable: boolean;
  condition?: (data: OnboardingDataV2) => boolean;
  options?: { label: string; value: string; category?: string }[];
}

/* ====== Constants ====== */

const PHASE_COLORS: Record<string, string> = {
  preliminary: '#6C3CE1',
  disability: '#FF6B9D',
  cognitive: '#4ECDC4',
  social: '#FFD43B',
  motor: '#2ED573',
  traits: '#8B5CF6',
};

const PHASE_LABELS: Record<string, string> = {
  preliminary: 'きほん',
  disability: 'しんだん',
  cognitive: 'にんち',
  social: 'こころ',
  motor: 'からだ',
  traits: 'とくせい',
};

const TOTAL_STEPS = 25;

const SPEECH_OPTIONS = [
  { label: '発語なし', value: 'nonverbal' },
  { label: '発語なしだが、はい/いいえは伝えられる', value: 'nonverbal_yesno' },
  { label: '単語は出るが文にならない', value: 'single_words' },
  { label: '話せるが聞き取りにくいことがある', value: 'partial_verbal' },
  { label: '会話ができる', value: 'verbal' },
];

const AGE_OPTIONS = [
  { label: '2歳', value: '2' },
  { label: '3歳', value: '3' },
  { label: '4歳', value: '4' },
  { label: '5歳', value: '5' },
  { label: '6歳', value: '6' },
  { label: '7歳以上', value: '7' },
];

const DISABILITY_OPTIONS = [
  { label: '自閉スペクトラム症（ASD）', value: 'asd', category: '発達障害' },
  { label: 'ADHD（不注意優勢）', value: 'adhd_inattentive', category: '発達障害' },
  { label: 'ADHD（多動・衝動優勢）', value: 'adhd_hyperactive', category: '発達障害' },
  { label: 'ADHD（混合型）', value: 'adhd_combined', category: '発達障害' },
  { label: '知的障害（軽度）', value: 'id_mild', category: '知的障害' },
  { label: '知的障害（中度）', value: 'id_moderate', category: '知的障害' },
  { label: '知的障害（重度）', value: 'id_severe', category: '知的障害' },
  { label: '知的障害（程度不明）', value: 'id_unspecified', category: '知的障害' },
  { label: '境界知能', value: 'borderline_iq', category: '知的障害' },
  { label: '読字障害（ディスレクシア）', value: 'ld_dyslexia', category: '学習障害' },
  { label: '書字障害（ディスグラフィア）', value: 'ld_dysgraphia', category: '学習障害' },
  { label: '算数障害（ディスカリキュリア）', value: 'ld_dyscalculia', category: '学習障害' },
  { label: '発達性協調運動障害（DCD）', value: 'dcd', category: 'その他' },
  { label: '言語発達遅滞', value: 'language_delay', category: 'その他' },
  { label: 'てんかん', value: 'epilepsy', category: 'その他' },
  { label: 'その他', value: 'other', category: 'その他' },
];

const CONCERN_OPTIONS = [
  { label: 'ことばの遅れ', value: 'concern_language' },
  { label: 'こだわりが強い', value: 'concern_rigidity' },
  { label: '落ち着きがない', value: 'concern_hyperactive' },
  { label: '集団になじめない', value: 'concern_social' },
  { label: '感覚の過敏さ', value: 'concern_sensory' },
  { label: '手先の不器用さ', value: 'concern_motor' },
  { label: '気持ちの切り替えが難しい', value: 'concern_regulation' },
  { label: '特にない', value: 'concern_none' },
];

const BEHAVIORAL_TRAIT_OPTIONS = [
  { label: 'こだわりが強い', value: 'rigid_routine' },
  { label: 'かんしゃくが起きやすい', value: 'frequent_tantrums' },
  { label: 'じっとしているのが難しい', value: 'hyperactive' },
  { label: '気が散りやすい', value: 'inattentive' },
  { label: '不安が強い', value: 'high_anxiety' },
  { label: '特にない', value: 'none' },
];

const SOCIAL_TRAIT_OPTIONS = [
  { label: '集団活動が苦手', value: 'group_difficulty' },
  { label: '順番を待つのが難しい', value: 'difficulty_taking_turns' },
  { label: '目が合いにくい', value: 'limited_eye_contact' },
  { label: '名前を呼んでも反応しにくい', value: 'poor_name_response' },
  { label: '特にない', value: 'none' },
];

/* ====== Screen Definitions ====== */

const SCREENS: ScreenDef[] = [
  // Phase 0: Account
  {
    id: 0, type: 'account', phase: 'account',
    expression: 'waving', expressionSize: 120,
    title: 'Manasへようこそ', dataKey: 'account', skippable: false,
  },
  // Phase 1: Preliminary
  {
    id: 1, type: 'single_select', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'happy', expressionSize: 120,
    title: 'お子さまの年齢をおしえてください',
    subtitle: 'お子さまに合った体験をお届けします',
    dataKey: 'childAge', skippable: false,
    options: AGE_OPTIONS,
  },
  {
    id: 2, type: 'text_input', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'pointing', expressionSize: 100,
    title: 'お子さまのおなまえは？',
    subtitle: 'ニックネームでも大丈夫です',
    dataKey: 'childName', skippable: false,
  },
  {
    id: 3, type: 'single_select', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'encouraging', expressionSize: 120,
    title: 'お子さまの発話の状態は？',
    dataKey: 'speechLevel', skippable: false,
    options: SPEECH_OPTIONS,
  },
  // Phase 2: Disability
  {
    id: 4, type: 'yes_no', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'surprised', expressionSize: 120,
    title: '専門家の発達評価を受けたことはありますか？',
    dataKey: 'hasEvaluation', skippable: true,
  },
  {
    id: 5, type: 'multi_chips', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'encouraging', expressionSize: 100,
    title: '診断を受けているものを選んでください',
    subtitle: '複数選択できます。あとから変更も可能です',
    dataKey: 'disabilities', skippable: true,
    options: DISABILITY_OPTIONS,
    condition: (d) => d.hasEvaluation === 'yes',
  },
  {
    id: 6, type: 'multi_chips', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'encouraging', expressionSize: 100,
    title: '気になっていることはありますか？',
    subtitle: 'あてはまるものを選んでください',
    dataKey: 'concerns', skippable: true,
    options: CONCERN_OPTIONS,
    condition: (d) => d.hasEvaluation !== 'yes',
  },
  // Phase 3: Cognitive (screens 7-14)
  {
    id: 7, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: 'お子さまは好きな遊びに3分以上集中できますか？',
    domain: 'attention', dataKey: 'q_attention', skippable: true,
  },
  {
    id: 8, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '「まって」と言われたとき、少しの間がまんできますか？',
    domain: 'inhibition', dataKey: 'q_inhibition', skippable: true,
  },
  {
    id: 9, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '2つの指示を続けて覚えて実行できますか？（例:「くつをはいて、かばんをもって」）',
    domain: 'working_memory', dataKey: 'q_working_memory', skippable: true,
  },
  {
    id: 10, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '昨日やったことを思い出して教えてくれますか？',
    domain: 'memory', dataKey: 'q_memory', skippable: true,
  },
  {
    id: 11, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '簡単な指示にすばやく反応できますか？（例:「手をたたいて」）',
    domain: 'processing_speed', dataKey: 'q_processing_speed', skippable: true,
  },
  {
    id: 12, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '遊びやルールが変わったとき、切り替えられますか？',
    domain: 'cognitive_flexibility', dataKey: 'q_cognitive_flexibility', skippable: true,
  },
  {
    id: 13, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '簡単なパターンやルールに気づきますか？（例: 赤→青→赤→？）',
    domain: 'reasoning', dataKey: 'q_reasoning', skippable: true,
  },
  {
    id: 14, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '三角や四角などの形を見分けられますか？',
    domain: 'visuospatial', dataKey: 'q_visuospatial', skippable: true,
  },
  // Phase 4: Social (screens 15-18)
  {
    id: 15, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '他の人が泣いていたり怒っていると気づきますか？',
    domain: 'social_cognition', dataKey: 'q_social_cognition', skippable: true,
  },
  {
    id: 16, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '気持ちが高ぶったとき、少しずつ落ち着くことができますか？',
    domain: 'emotion_regulation', dataKey: 'q_emotion_regulation', skippable: true,
  },
  {
    id: 17, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '色や数字の名前をいくつか言えますか？',
    domain: 'language', dataKey: 'q_language', skippable: true,
  },
  {
    id: 18, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '簡単なパズルや型はめを自分で試しますか？',
    domain: 'planning', dataKey: 'q_planning', skippable: true,
  },
  // Phase 5: Motor (screens 19-21)
  {
    id: 19, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: 'ボタンをとめたり、小さなものをつまんだりできますか？',
    domain: 'motor_skills', dataKey: 'q_motor_skills', skippable: true,
  },
  {
    id: 20, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: '絵の中から特定のものを見つけることができますか？（例: 「犬はどこ？」）',
    domain: 'perceptual', dataKey: 'q_perceptual', skippable: true,
  },
  {
    id: 21, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: '音や光、触られることにとても敏感ですか？',
    domain: 'sensory', dataKey: 'q_sensory_sensitive', skippable: true,
  },
  // Phase 6: Traits (screens 22-23)
  {
    id: 22, type: 'multi_chips', phase: 'traits',
    phaseLabel: 'とくせい', phaseColor: PHASE_COLORS.traits,
    expression: 'encouraging', expressionSize: 100,
    title: 'あてはまるものはありますか？',
    subtitle: 'お子さまに合った配慮をするための質問です',
    dataKey: 'behavioralTraits', skippable: true,
    options: BEHAVIORAL_TRAIT_OPTIONS,
  },
  {
    id: 23, type: 'multi_chips', phase: 'traits',
    phaseLabel: 'とくせい', phaseColor: PHASE_COLORS.traits,
    expression: 'happy', expressionSize: 100,
    title: '人との関わりで気になることはありますか？',
    dataKey: 'socialTraits', skippable: true,
    options: SOCIAL_TRAIT_OPTIONS,
  },
  // Phase 7: Complete
  {
    id: 24, type: 'complete', phase: 'complete',
    expression: 'excited', expressionSize: 160,
    title: '準備ができました！',
    dataKey: 'complete', skippable: false,
  },
];

/* ====== Helpers ====== */

const STORAGE_KEY = 'manas_onboarding_v2';

function saveToSession(screenIdx: number, data: OnboardingDataV2) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ screenIdx, data }));
  } catch { /* ignore */ }
}

function loadFromSession(): { screenIdx: number; data: OnboardingDataV2 } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function clearSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function ageToAgeGroup(age: number): AgeGroup {
  if (age <= 5) return '3-5';
  return '6-9';
}

function estimateInitialLevel(answer: DomainAnswer): number {
  switch (answer) {
    case 'yes': return 3;
    case 'no': return 1;
    case 'unknown': return 2;
    case 'skipped': return 2;
  }
}

function defaultData(): OnboardingDataV2 {
  return {
    email: '',
    password: '',
    childAge: 4,
    childName: '',
    speechLevel: 'verbal',
    hasEvaluation: 'no',
    disabilities: [],
    concerns: [],
    domainAnswers: {},
    behavioralTraits: [],
    socialTraits: [],
    sensorySensitive: 'skipped',
  };
}

/* ====== Slide Variants ====== */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/* ====== Main Component ====== */

export default function OnboardingPage() {
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

  const handleSkip = useCallback(() => {
    // For domain yes/no questions, record 'skipped'
    if (currentScreen?.domain) {
      setData((prev) => ({
        ...prev,
        domainAnswers: { ...prev.domainAnswers, [currentScreen.domain!]: 'skipped' },
      }));
    }
    goForward();
  }, [currentScreen, goForward]);

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

    if (screen.dataKey === 'childAge') {
      setData((prev) => ({ ...prev, childAge: parseInt(value) }));
    } else if (screen.dataKey === 'speechLevel') {
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
      // "none" / "concern_none" clears others
      if (value === 'none' || value === 'concern_none') {
        return { ...prev, [key]: current.includes(value) ? [] : [value] };
      }
      // Selecting a non-none option removes "none"/"concern_none"
      const withoutNone = current.filter((v) => v !== 'none' && v !== 'concern_none');
      if (withoutNone.includes(value)) {
        return { ...prev, [key]: withoutNone.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...withoutNone, value] };
    });
  }, [currentScreen]);

  // Account creation
  const handleAccountNext = async () => {
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
      if (!isSupabaseEnabled) {
        goForward();
        return;
      }
      const { error } = await supabase.auth.signUp({ email: data.email, password: data.password });
      if (error) { setAuthError(error.message); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (signInError) console.warn('Auto sign-in failed:', signInError.message);
      goForward();
    } catch {
      setAuthError('アカウント作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // Final save
  const handleFinish = async () => {
    setSaving(true);
    try {
      const ageGroup = ageToAgeGroup(data.childAge);

      if (!isSupabaseEnabled) {
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
        clearSession();
        router.push('/');
        return;
      }

      let { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const { error: reSignInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
        if (reSignInError) { setAuthError('ログイン状態が確認できません。最初からやり直してください。'); return; }
        const { data: retryData } = await supabase.auth.getUser();
        userData = retryData;
        if (!userData.user) { setAuthError('ログイン状態が確認できません'); return; }
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

      if (childError) {
        setAuthError(`お子さま情報の保存に失敗しました: ${childError.message}`);
        return;
      }

      if (childRow) {
        await supabase.from('child_profiles').insert({
          child_id: childRow.id,
          speech_level: data.speechLevel,
          disability_types: data.disabilities,
          concerns: data.concerns,
          traits: [...data.behavioralTraits, ...data.socialTraits],
          domain_answers: data.domainAnswers,
        });

        // Set initial domain levels
        const domainLevels = Object.entries(data.domainAnswers).map(([domain, answer]) => ({
          child_id: childRow.id,
          domain,
          current_level: estimateInitialLevel(answer),
        }));
        if (domainLevels.length > 0) {
          await supabase.from('domain_progress').upsert(domainLevels, { onConflict: 'child_id,domain' });
        }
      }

      clearSession();
      router.push('/');
    } catch {
      setAuthError('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDebugReset = () => {
    clearSession();
    document.cookie = 'manas_demo_session=; path=/; max-age=0';
    clearLocalProfile();
    clearChildCache();
    setData(defaultData());
    setScreenIdx(0);
    setAuthError('');
    setSaving(false);
  };

  if (!initialized) return null;

  const showBackButton = screenIdx > 0;
  const showSkip = currentScreen?.skippable && currentScreen.phase !== 'account' && currentScreen.phase !== 'preliminary';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0D0D2B' }}>
      {/* Header: Back + Progress + Skip */}
      <div
        className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
        style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}
      >
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button onClick={goBack} className="tap-target flex-shrink-0 text-stardust">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div className="w-6 flex-shrink-0" />
            )}
            <CosmicProgressBar progress={progress} className="flex-1" />
            {showSkip ? (
              <button onClick={handleSkip} className="flex-shrink-0 text-sm text-cosmic font-medium">
                スキップ
              </button>
            ) : (
              <button onClick={handleDebugReset} className="flex-shrink-0 text-xs text-moon/60 border border-moon/30 rounded-lg px-2 py-1 active:bg-nebula/20">
                RESET
              </button>
            )}
          </div>
          {/* Phase label */}
          {currentScreen?.phaseLabel && (
            <p className="text-xs font-bold tracking-widest mt-2 ml-9" style={{ color: currentScreen.phaseColor }}>
              {currentScreen.phaseLabel}
            </p>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex flex-col min-h-screen pt-28 pb-0">
        <div className="flex-1 max-w-[430px] mx-auto w-full px-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen?.id ?? 0}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {currentScreen?.type === 'account' && (
                <AccountScreen
                  data={data}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  error={authError}
                  saving={saving}
                  onChange={(email, password) => setData({ ...data, email, password })}
                  onNext={handleAccountNext}
                />
              )}
              {currentScreen?.type === 'yes_no' && (
                <YesNoScreen
                  screen={currentScreen}
                  answer={
                    currentScreen.domain
                      ? (data.domainAnswers[currentScreen.domain] as YesNoAnswer | undefined)
                      : currentScreen.dataKey === 'hasEvaluation'
                        ? data.hasEvaluation
                        : undefined
                  }
                  onAnswer={handleYesNo}
                />
              )}
              {currentScreen?.type === 'single_select' && (
                <SingleSelectScreen
                  screen={currentScreen}
                  selectedValue={
                    currentScreen.dataKey === 'childAge'
                      ? String(data.childAge)
                      : currentScreen.dataKey === 'speechLevel'
                        ? data.speechLevel
                        : ''
                  }
                  onSelect={handleSingleSelect}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'text_input' && (
                <TextInputScreen
                  screen={currentScreen}
                  value={data.childName}
                  onChange={(v) => setData({ ...data, childName: v })}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'multi_chips' && (
                <MultiChipScreen
                  screen={currentScreen}
                  selected={
                    currentScreen.dataKey === 'disabilities' ? data.disabilities
                    : currentScreen.dataKey === 'concerns' ? data.concerns
                    : currentScreen.dataKey === 'behavioralTraits' ? data.behavioralTraits
                    : data.socialTraits
                  }
                  onToggle={handleChipToggle}
                  onNext={goForward}
                />
              )}
              {currentScreen?.type === 'complete' && (
                <CompleteScreen
                  childName={data.childName}
                  error={authError}
                  saving={saving}
                  onFinish={handleFinish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ====== Support needs builder ====== */

function buildSupportNeeds(data: OnboardingDataV2): string {
  const parts: string[] = [];
  if (data.disabilities.length > 0) parts.push(`disabilities: ${data.disabilities.join(', ')}`);
  if (data.concerns.length > 0) parts.push(`concerns: ${data.concerns.join(', ')}`);
  if (data.behavioralTraits.length > 0) parts.push(`behavioral: ${data.behavioralTraits.join(', ')}`);
  if (data.socialTraits.length > 0) parts.push(`social: ${data.socialTraits.join(', ')}`);
  return parts.join('; ') || '';
}

/* ====== Screen Components ====== */

/* -- Account Screen -- */

function AccountScreen({
  data,
  showPassword,
  onTogglePassword,
  error,
  saving,
  onChange,
  onNext,
}: {
  data: OnboardingDataV2;
  showPassword: boolean;
  onTogglePassword: () => void;
  error: string;
  saving: boolean;
  onChange: (email: string, password: string) => void;
  onNext: () => void;
}) {
  const canProceed = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(data.email) && data.password.length >= 8;
  }, [data.email, data.password]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression="waving" size={120} />
      <h2 className="text-xl font-bold text-stardust">Manasへようこそ</h2>

      <div className="w-full flex flex-col gap-3">
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange(e.target.value, data.password)}
          placeholder="メールアドレス"
          className="w-full h-12 px-4 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onChange(data.email, e.target.value)}
            placeholder="パスワード（8文字以上）"
            className="w-full h-12 px-4 pr-12 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
          />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-moon">
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <p className="w-full text-sm text-supernova">{error}</p>}

      <button
        type="button"
        disabled={!canProceed || saving}
        onClick={onNext}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '処理中...' : 'アカウントを作成'}
      </button>

      <p className="text-sm text-moon">
        すでにアカウントをお持ちの方は{' '}
        <a href="/login" className="text-cosmic underline">ログイン</a>
      </p>
    </div>
  );
}

/* -- Yes/No/Unknown Screen -- */

function YesNoScreen({
  screen,
  answer,
  onAnswer,
}: {
  screen: ScreenDef;
  answer?: YesNoAnswer;
  onAnswer: (a: YesNoAnswer) => void;
}) {
  const [selected, setSelected] = useState<YesNoAnswer | null>(null);

  const handleSelect = (a: YesNoAnswer) => {
    setSelected(a);
    onAnswer(a);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <h2 className="text-lg font-bold text-stardust text-center leading-relaxed">
        {screen.title}
      </h2>

      <div className="w-full flex gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('yes')}
          className={`flex-1 h-14 rounded-2xl text-lg font-bold transition-all ${
            selected === 'yes' || answer === 'yes'
              ? 'bg-cosmic text-white'
              : 'bg-galaxy-light text-stardust'
          }`}
        >
          はい
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('no')}
          className={`flex-1 h-14 rounded-2xl text-lg font-bold transition-all ${
            selected === 'no' || answer === 'no'
              ? 'bg-cosmic text-white'
              : 'bg-galaxy-light text-stardust'
          }`}
        >
          いいえ
        </motion.button>
      </div>

      <button
        type="button"
        onClick={() => handleSelect('unknown')}
        className={`text-sm font-medium transition-colors ${
          selected === 'unknown' || answer === 'unknown' ? 'text-cosmic-light' : 'text-cosmic'
        }`}
      >
        わからない
      </button>
    </div>
  );
}

/* -- Single Select Screen -- */

function SingleSelectScreen({
  screen,
  selectedValue,
  onSelect,
  onNext,
}: {
  screen: ScreenDef;
  selectedValue: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full flex flex-col">
        {screen.options?.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`w-full flex items-center justify-between px-4 py-4 transition-all ${
              i > 0 ? 'border-t border-galaxy-light' : ''
            } ${
              selectedValue === opt.value ? 'bg-galaxy-light' : ''
            }`}
          >
            <span className="text-base text-stardust">{opt.label}</span>
            {selectedValue === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <StickyNextButton
        label="つぎへ"
        disabled={!selectedValue}
        onClick={onNext}
      />
    </div>
  );
}

/* -- Text Input Screen -- */

function TextInputScreen({
  screen,
  value,
  onChange,
  onNext,
}: {
  screen: ScreenDef;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: たろう"
        autoFocus
        className="w-full h-14 px-4 rounded-xl text-lg bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon text-center"
      />

      <StickyNextButton
        label="つぎへ"
        disabled={!value.trim()}
        onClick={onNext}
      />
    </div>
  );
}

/* -- Multi Chip Screen -- */

function MultiChipScreen({
  screen,
  selected,
  onToggle,
  onNext,
}: {
  screen: ScreenDef;
  selected: string[];
  onToggle: (value: string) => void;
  onNext: () => void;
}) {
  // Group by category if categories exist
  const categories = useMemo(() => {
    const opts = screen.options || [];
    const cats = new Map<string, typeof opts>();
    for (const opt of opts) {
      const cat = opt.category || '';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(opt);
    }
    return cats;
  }, [screen.options]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <Mogura expression={screen.expression} size={screen.expressionSize} />
        <div className="text-center">
          <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
          {screen.subtitle && (
            <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
          )}
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto pb-4">
        {Array.from(categories.entries()).map(([cat, opts]) => (
          <div key={cat || '_default'}>
            {cat && (
              <p className="text-xs font-semibold text-moon uppercase tracking-wide mt-4 mb-2">
                {cat}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {opts.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggle(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    selected.includes(opt.value)
                      ? 'bg-cosmic text-white border border-cosmic shadow-sm'
                      : 'bg-galaxy-light text-stardust border border-galaxy-light'
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StickyNextButton label="つぎへ" onClick={onNext} />
    </div>
  );
}

/* -- Complete Screen -- */

function CompleteScreen({
  childName,
  error,
  saving,
  onFinish,
}: {
  childName: string;
  error: string;
  saving: boolean;
  onFinish: () => void;
}) {
  const displayName = childName || 'おともだち';

  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-12">
      <Mogura expression="excited" size={160} />

      <h2 className="text-2xl font-bold text-stardust">準備ができました！</h2>
      <p className="text-base text-moon">
        {displayName}さんに合わせたトレーニングを始めましょう
      </p>

      {error && <p className="w-full text-sm text-supernova text-center">{error}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={onFinish}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '保存中...' : 'はじめる'}
      </button>
    </div>
  );
}

/* -- Sticky Next Button -- */

function StickyNextButton({
  label = 'つぎへ',
  disabled = false,
  saving = false,
  onClick,
}: {
  label?: string;
  disabled?: boolean;
  saving?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 w-full pt-4 pb-8 bg-gradient-to-t from-[#0D0D2B]/90 to-transparent">
      <button
        type="button"
        disabled={disabled || saving}
        onClick={onClick}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '処理中...' : label}
      </button>
    </div>
  );
}
