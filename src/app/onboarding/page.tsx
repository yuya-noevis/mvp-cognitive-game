'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { useRouter } from 'next/navigation';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { generateAnonChildId } from '@/lib/utils';
import type { AgeGroup } from '@/types';
import { setLocalChildProfile, setLocalConsents, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';

const TOTAL_STEPS = 8;

interface OnboardingData {
  email: string;
  password: string;
  role: 'parent' | 'supporter' | null;
  childName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  disabilities: string[];
  disabilitySeverity: string;
  traits: string[];
  facilities: string[];
}

const STORAGE_KEY = 'manas_onboarding';

function saveToSession(step: number, data: OnboardingData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {
    // ignore
  }
}

function loadFromSession(): { step: number; data: OnboardingData } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function computeAgeGroup(birthYear: number, birthMonth: number, birthDay: number): AgeGroup {
  const now = new Date();
  const birth = new Date(birthYear, birthMonth - 1, birthDay);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  if (age <= 5) return '3-5';
  if (age <= 9) return '6-9';
  return '10-15';
}

/* ====== Disability options (flat list) ====== */

const DISABILITY_OPTIONS: { label: string; value: string }[] = [
  { label: '自閉スペクトラム症（ASD）', value: 'asd' },
  { label: 'ADHD', value: 'adhd' },
  { label: '知的障害', value: 'intellectual_disability' },
  { label: '読字障害（ディスレクシア）', value: 'ld_dyslexia' },
  { label: '書字障害（ディスグラフィア）', value: 'ld_dysgraphia' },
  { label: '算数障害（ディスカリキュリア）', value: 'ld_dyscalculia' },
  { label: '発達性協調運動障害（DCD）', value: 'dcd' },
  { label: '言語発達遅滞', value: 'language_delay' },
  { label: '構音障害', value: 'articulation_disorder' },
  { label: '吃音（きつおん）', value: 'stuttering' },
  { label: '場面緘黙（かんもく）', value: 'selective_mutism' },
  { label: 'てんかん', value: 'epilepsy' },
  { label: 'チック症 / トゥレット症候群', value: 'tic_tourette' },
  { label: '愛着障害', value: 'attachment_disorder' },
  { label: '不安障害', value: 'anxiety_disorder' },
  { label: '感覚処理障害（SPD）', value: 'spd' },
  { label: '境界知能（ボーダーライン）', value: 'borderline_iq' },
  { label: '診断は受けていないが気になる点がある', value: 'undiagnosed_concern' },
  { label: 'その他', value: 'other' },
];

const SEVERITY_OPTIONS: { label: string; value: string }[] = [
  { label: '軽度', value: 'mild' },
  { label: '中度', value: 'moderate' },
  { label: '重度', value: 'severe' },
];

/* ====== Trait options ====== */

const TRAIT_CATEGORIES: { label: string; items: { label: string; value: string }[] }[] = [
  {
    label: '感覚',
    items: [
      { label: '音に敏感（聴覚過敏）', value: 'auditory_hypersensitive' },
      { label: '光・色に敏感（視覚過敏）', value: 'visual_hypersensitive' },
      { label: '触られるのが苦手（触覚過敏）', value: 'tactile_hypersensitive' },
      { label: '匂いに敏感（嗅覚過敏）', value: 'olfactory_hypersensitive' },
      { label: '特定の食感が苦手（偏食）', value: 'food_texture_sensitive' },
      { label: '感覚を求める（感覚探求）', value: 'sensory_seeking' },
      { label: '痛みや温度に鈍感（感覚鈍麻）', value: 'sensory_hyposensitive' },
    ],
  },
  {
    label: 'コミュニケーション・言語',
    items: [
      { label: '発語がない・少ない', value: 'no_speech' },
      { label: '単語は出るが文にならない', value: 'single_words_only' },
      { label: '会話はできるが一方的になりやすい', value: 'one_sided_conversation' },
      { label: '言葉の意味理解が難しい', value: 'poor_comprehension' },
      { label: '簡単な指示の理解が難しい', value: 'difficulty_instructions_basic' },
      { label: '複数ステップの指示が難しい', value: 'difficulty_instructions_complex' },
      { label: '非言語コミュニケーションの理解が難しい', value: 'nonverbal_comprehension_difficulty' },
    ],
  },
  {
    label: '行動・情緒',
    items: [
      { label: 'こだわりが強い（ルーティン固執）', value: 'rigid_routine' },
      { label: '気持ちの切り替えが難しい', value: 'emotional_regulation_difficulty' },
      { label: 'かんしゃくが起きやすい', value: 'frequent_tantrums' },
      { label: 'じっとしているのが難しい', value: 'hyperactive' },
      { label: '気が散りやすい', value: 'inattentive' },
      { label: '不安が強い', value: 'high_anxiety' },
      { label: '自傷行為がある', value: 'self_injury' },
      { label: '他害行為がある', value: 'aggression' },
    ],
  },
  {
    label: '社会性',
    items: [
      { label: '集団活動が苦手', value: 'group_difficulty' },
      { label: '順番を待つのが難しい', value: 'difficulty_taking_turns' },
      { label: '友達との関わりが難しい', value: 'peer_interaction_difficulty' },
      { label: '目が合いにくい', value: 'limited_eye_contact' },
      { label: '共同注意が難しい', value: 'joint_attention_difficulty' },
    ],
  },
  {
    label: '運動・身体',
    items: [
      { label: '手先が不器用（微細運動）', value: 'fine_motor_difficulty' },
      { label: '体の動きがぎこちない（粗大運動）', value: 'gross_motor_difficulty' },
      { label: 'バランスが取りにくい', value: 'balance_difficulty' },
      { label: '姿勢の保持が難しい', value: 'posture_difficulty' },
    ],
  },
  {
    label: '生活・その他',
    items: [
      { label: '睡眠の問題がある', value: 'sleep_issues' },
      { label: '排泄の自立が遅れている', value: 'toileting_delay' },
      { label: '新しい環境への適応が難しい', value: 'adaptation_difficulty' },
    ],
  },
];

/* ====== Facility options ====== */

const FACILITY_OPTIONS: { label: string; value: string }[] = [
  { label: '児童発達支援センター', value: 'child_dev_center' },
  { label: '児童発達支援事業所', value: 'child_dev_service' },
  { label: '幼稚園 / 保育園', value: 'kindergarten_nursery' },
  { label: '放課後等デイサービス', value: 'after_school_day' },
  { label: '特別支援学校', value: 'special_needs_school' },
  { label: '特別支援学級（通常校内）', value: 'special_needs_class' },
  { label: '通級指導教室', value: 'resource_room' },
  { label: '療育センター', value: 'therapy_center' },
  { label: 'その他', value: 'other_facility' },
  { label: '現在どこにも通っていない', value: 'none' },
];

/* ====== Slide animation variants ====== */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/* ====== Main Component ====== */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    email: '',
    password: '',
    role: null,
    childName: '',
    birthYear: 2022,
    birthMonth: 3,
    birthDay: 15,
    disabilities: [],
    disabilitySeverity: '',
    traits: [],
    facilities: [],
  });

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = loadFromSession();
    if (saved) {
      setData(saved.data);
      setStep(saved.step);
    }
    setInitialized(true);
  }, []);

  // Persist to sessionStorage on change (debounced to avoid flicker)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!initialized) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToSession(step, data);
    }, 300);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [step, data, initialized]);

  const progress = (step + 1) / TOTAL_STEPS;

  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleStep1Next = async () => {
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

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        console.warn('Auto sign-in after signUp failed:', signInError.message);
      }
      goForward();
    } catch {
      setAuthError('アカウント作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalStep = async () => {
    setSaving(true);
    try {
      if (!isSupabaseEnabled) {
        const ageGroup = computeAgeGroup(data.birthYear, data.birthMonth, data.birthDay);
        const anonChildId = generateAnonChildId();
        const localId = `local_${anonChildId}`;
        const consentDefaults = { data_optimization: false, research_use: false, biometric: false };

        setLocalChildProfile({
          id: localId,
          anonChildId,
          displayName: data.childName,
          ageGroup,
          avatarId: 'avatar_01',
          settings: {},
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
        const { error: reSignInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (reSignInError) {
          setAuthError('ログイン状態が確認できません。最初からやり直してください。');
          return;
        }
        const { data: retryData } = await supabase.auth.getUser();
        userData = retryData;
        if (!userData.user) {
          setAuthError('ログイン状態が確認できません');
          return;
        }
      }

      const ageGroup = computeAgeGroup(data.birthYear, data.birthMonth, data.birthDay);
      const anonChildId = generateAnonChildId();
      const birthDate = `${data.birthYear}-${String(data.birthMonth).padStart(2, '0')}-${String(data.birthDay).padStart(2, '0')}`;

      // Build disability array with severity if applicable
      const finalDisabilities = [...data.disabilities];
      if (data.disabilities.includes('intellectual_disability') && data.disabilitySeverity) {
        finalDisabilities.push(`id_${data.disabilitySeverity}`);
      }

      const { data: childRow, error: childError } = await supabase
        .from('children')
        .insert({
          anon_child_id: anonChildId,
          parent_user_id: userData.user.id,
          display_name: data.childName,
          name: data.childName,
          birth_date: birthDate,
          birth_year_month: `${data.birthYear}-${String(data.birthMonth).padStart(2, '0')}`,
          age_group: ageGroup,
          avatar_id: 'avatar_01',
          parent_role: data.role || 'parent',
          is_onboarded: true,
          consent_flags: { data_optimization: false, research_use: false, biometric: false },
        })
        .select('id')
        .single();

      if (childError) {
        setAuthError(`お子さま情報の保存に失敗しました: ${childError.message} (${childError.code})`);
        console.error('childError:', childError);
        return;
      }

      if (childRow) {
        await supabase.from('child_profiles').insert({
          child_id: childRow.id,
          disability_types: finalDisabilities,
          traits: data.traits,
          facilities: data.facilities,
        });
      }

      clearSession();
      router.push('/');
    } catch {
      setAuthError('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const canProceedStep0 = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(data.email) && data.password.length >= 8;
  }, [data.email, data.password]);

  const canProceedStep1 = data.role !== null;
  const canProceedStep2 = data.childName.trim().length > 0;

  const handleDebugReset = () => {
    clearSession();
    // Clear demo session cookie
    document.cookie = 'manas_demo_session=; path=/; max-age=0';
    // Clear local profile (correct keys: manas_child_profile_v1 etc.)
    clearLocalProfile();
    clearChildCache();
    setData({
      email: '',
      password: '',
      role: null,
      childName: '',
      birthYear: 2022,
      birthMonth: 3,
      birthDay: 15,
      disabilities: [],
      disabilitySeverity: '',
      traits: [],
      facilities: [],
    });
    setStep(0);
    setAuthError('');
    setSaving(false);
  };

  if (!initialized) return null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/backgrounds/bg-onboarding.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-galaxy/60" />

      {/* Progress bar + back button */}
      <div
        className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
        style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}
      >
        <div className="max-w-[430px] mx-auto flex items-center gap-3">
          {step > 0 ? (
            <button onClick={goBack} className="tap-target flex-shrink-0 text-stardust">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="w-6 flex-shrink-0" />
          )}
          <CosmicProgressBar progress={progress} className="flex-1" />
          <button
            onClick={handleDebugReset}
            className="flex-shrink-0 text-xs text-moon/60 border border-moon/30 rounded-lg px-2 py-1 active:bg-nebula/20"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex flex-col min-h-screen pt-24 pb-0">
        <div className="flex-1 max-w-[430px] mx-auto w-full px-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {step === 0 && (
                <Step0Account
                  email={data.email}
                  password={data.password}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  error={authError}
                  saving={saving}
                  canProceed={canProceedStep0}
                  onChange={(email, password) => setData({ ...data, email, password })}
                  onNext={handleStep1Next}
                />
              )}
              {step === 1 && (
                <Step1Role
                  role={data.role}
                  canProceed={canProceedStep1}
                  onChange={(role) => setData({ ...data, role })}
                  onNext={goForward}
                />
              )}
              {step === 2 && (
                <Step2ChildName
                  childName={data.childName}
                  canProceed={canProceedStep2}
                  onChange={(childName) => setData({ ...data, childName })}
                  onNext={goForward}
                />
              )}
              {step === 3 && (
                <Step3Birthday
                  birthYear={data.birthYear}
                  birthMonth={data.birthMonth}
                  birthDay={data.birthDay}
                  onChange={(y, m, d) =>
                    setData({ ...data, birthYear: y, birthMonth: m, birthDay: d })
                  }
                  onNext={goForward}
                />
              )}
              {step === 4 && (
                <Step4Disabilities
                  selected={data.disabilities}
                  severity={data.disabilitySeverity}
                  onChange={(disabilities) => setData(prev => ({ ...prev, disabilities }))}
                  onChangeSeverity={(disabilitySeverity) => setData(prev => ({ ...prev, disabilitySeverity }))}
                  onNext={goForward}
                />
              )}
              {step === 5 && (
                <Step5Traits
                  selected={data.traits}
                  onChange={(traits) => setData({ ...data, traits })}
                  onNext={goForward}
                />
              )}
              {step === 6 && (
                <Step6Facilities
                  selected={data.facilities}
                  onChange={(facilities) => setData({ ...data, facilities })}
                  onNext={goForward}
                />
              )}
              {step === 7 && (
                <Step7Complete
                  error={authError}
                  saving={saving}
                  onFinish={handleFinalStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ====== Toggle Chip Component ====== */

function ToggleChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
        selected
          ? 'bg-cosmic text-white border border-cosmic shadow-sm'
          : 'bg-galaxy-light text-moon border border-galaxy-light'
      }`}
    >
      {label}
    </button>
  );
}

/* ====== Next Button (sticky bottom, larger) ====== */

function NextButton({
  label = '次へ',
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
    <div className="sticky bottom-0 left-0 right-0 w-full pt-4 pb-8 bg-gradient-to-t from-galaxy/90 to-transparent">
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

/* ====== Categorized Chips Component ====== */

function CategorizedChips({
  categories,
  selected,
  onToggle,
}: {
  categories: { label: string; items: { label: string; value: string }[] }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <>
      {categories.map((cat) => (
        <div key={cat.label}>
          <p className="text-xs font-semibold text-moon uppercase tracking-wide mt-4 mb-2">
            {cat.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((item) => (
              <ToggleChip
                key={item.value}
                label={item.label}
                selected={selected.includes(item.value)}
                onToggle={() => onToggle(item.value)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ====== Wheel Column Component ====== */

function WheelColumn({
  items,
  selectedValue,
  onChange,
  suffix = '',
}: {
  items: { label: string; value: number }[];
  selectedValue: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 44;
  const isScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === selectedValue);
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_HEIGHT;
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    isScrolling.current = true;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      // Snap to position
      ref.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      if (items[clamped].value !== selectedValue) {
        onChange(items[clamped].value);
      }
      isScrolling.current = false;
    }, 80);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * 5 }}>
      {/* Selection highlight bar */}
      <div
        className="absolute inset-x-0 pointer-events-none rounded-xl z-10"
        style={{
          top: ITEM_HEIGHT * 2,
          height: ITEM_HEIGHT,
          background: 'rgba(108, 60, 225, 0.15)',
          borderTop: '2px solid var(--color-cosmic)',
          borderBottom: '2px solid var(--color-cosmic)',
        }}
      />
      {/* Fade masks */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-20"
        style={{ height: ITEM_HEIGHT * 1.5, background: 'linear-gradient(to bottom, var(--color-galaxy-light), transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
        style={{ height: ITEM_HEIGHT * 1.5, background: 'linear-gradient(to top, var(--color-galaxy-light), transparent)' }}
      />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          height: ITEM_HEIGHT * 5,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <div
            key={item.value}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'start' }}
            className={`flex items-center justify-center transition-all ${
              item.value === selectedValue
                ? 'text-stardust font-bold text-xl'
                : 'text-moon text-base opacity-50'
            }`}
          >
            {item.label}{suffix}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====== Step 0: Account Creation ====== */

function Step0Account({
  email,
  password,
  showPassword,
  onTogglePassword,
  error,
  saving,
  canProceed,
  onChange,
  onNext,
}: {
  email: string;
  password: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  error: string;
  saving: boolean;
  canProceed: boolean;
  onChange: (email: string, password: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression="waving" size={100} />

      <h2 className="text-xl font-bold text-stardust">アカウントを作成</h2>

      <div className="w-full flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value, password)}
          placeholder="メールアドレス"
          className="w-full h-12 px-4 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onChange(email, e.target.value)}
            placeholder="パスワード（8文字以上）"
            className="w-full h-12 px-4 pr-12 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-moon"
          >
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

      {error && (
        <p className="w-full text-sm text-supernova">{error}</p>
      )}

      <NextButton disabled={!canProceed} saving={saving} onClick={onNext} />

      <p className="text-sm text-moon">
        すでにアカウントをお持ちの方は{' '}
        <a href="/login" className="text-comet underline">
          ログイン
        </a>
      </p>
    </div>
  );
}

/* ====== Step 1: Role Selection ====== */

function Step1Role({
  role,
  canProceed,
  onChange,
  onNext,
}: {
  role: 'parent' | 'supporter' | null;
  canProceed: boolean;
  onChange: (role: 'parent' | 'supporter') => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-stardust">あなたのお立場を教えてください</h2>

      <div className="w-full flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onChange('parent')}
          className={`w-full py-6 px-5 flex items-center gap-4 rounded-2xl transition-all duration-200 ${
            role === 'parent'
              ? 'bg-galaxy-light border-2 border-cosmic shadow-lg scale-[1.02]'
              : 'bg-galaxy-light border-2 border-transparent'
          }`}
        >
          <div className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cosmic">
              <path
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-stardust">保護者</p>
            <p className="text-sm text-moon">お子さまの保護者の方</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('supporter')}
          className={`w-full py-6 px-5 flex items-center gap-4 rounded-2xl transition-all duration-200 ${
            role === 'supporter'
              ? 'bg-galaxy-light border-2 border-cosmic shadow-lg scale-[1.02]'
              : 'bg-galaxy-light border-2 border-transparent'
          }`}
        >
          <div className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cosmic">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-stardust">支援者・関係者</p>
            <p className="text-sm text-moon">療育・教育関係者の方</p>
          </div>
        </button>
      </div>

      <NextButton disabled={!canProceed} onClick={onNext} />
    </div>
  );
}

/* ====== Step 2: Child Name (separate) ====== */

function Step2ChildName({
  childName,
  canProceed,
  onChange,
  onNext,
}: {
  childName: string;
  canProceed: boolean;
  onChange: (name: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression="happy" size={100} />

      <h2 className="text-xl font-bold text-stardust">お子さまのお名前</h2>
      <p className="text-sm text-moon -mt-3">ニックネームでもOKです</p>

      <div className="w-full">
        <input
          type="text"
          value={childName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例: たろう"
          autoFocus
          className="w-full h-14 px-4 rounded-xl text-lg bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon text-center"
        />
      </div>

      <NextButton disabled={!canProceed} onClick={onNext} />
    </div>
  );
}

/* ====== Step 3: Birthday (Wheel Picker) ====== */

function Step3Birthday({
  birthYear,
  birthMonth,
  birthDay,
  onChange,
  onNext,
}: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  onChange: (y: number, m: number, d: number) => void;
  onNext: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({ length: currentYear - 2000 }, (_, i) => ({
        label: String(currentYear - i),
        value: currentYear - i,
      })),
    [currentYear]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
      })),
    []
  );

  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
      })),
    [daysInMonth]
  );

  // Clamp day if month/year changed
  const clampedDay = Math.min(birthDay, daysInMonth);

  const age = useMemo(() => {
    const now = new Date();
    const birth = new Date(birthYear, birthMonth - 1, clampedDay);
    let a = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) a--;
    return a;
  }, [birthYear, birthMonth, clampedDay]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-stardust">生年月日を選んでください</h2>

      <div className="w-full bg-galaxy-light rounded-2xl p-4">
        <div className="flex gap-2">
          <WheelColumn
            items={years}
            selectedValue={birthYear}
            onChange={(y) => onChange(y, birthMonth, Math.min(clampedDay, new Date(y, birthMonth, 0).getDate()))}
            suffix="年"
          />
          <WheelColumn
            items={months}
            selectedValue={birthMonth}
            onChange={(m) => onChange(birthYear, m, Math.min(clampedDay, new Date(birthYear, m, 0).getDate()))}
            suffix="月"
          />
          <WheelColumn
            items={days}
            selectedValue={clampedDay}
            onChange={(d) => onChange(birthYear, birthMonth, d)}
            suffix="日"
          />
        </div>
      </div>

      <p className="text-base text-moon">
        {birthYear}年{birthMonth}月{clampedDay}日（{age >= 0 ? `${age}歳` : '--'}）
      </p>

      <NextButton onClick={onNext} />
    </div>
  );
}

/* ====== Step 4: Disability Types (flat, with conditional severity) ====== */

function Step4Disabilities({
  selected,
  severity,
  onChange,
  onChangeSeverity,
  onNext,
}: {
  selected: string[];
  severity: string;
  onChange: (v: string[]) => void;
  onChangeSeverity: (v: string) => void;
  onNext: () => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value);
      onChange(next);
      if (value === 'intellectual_disability') {
        onChangeSeverity('');
      }
    } else {
      onChange([...selected, value]);
    }
  };

  const showSeverity = selected.includes('intellectual_disability');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-stardust">診断・障害について教えてください</h2>
        <p className="text-sm text-moon mt-1">
          複数選択できます。あとから変更も可能です。
        </p>
      </div>

      <div className="max-h-[55vh] overflow-y-auto pb-20">
        <div className="flex flex-wrap gap-2">
          {DISABILITY_OPTIONS.map((item) => (
            <ToggleChip
              key={item.value}
              label={item.label}
              selected={selected.includes(item.value)}
              onToggle={() => toggle(item.value)}
            />
          ))}
        </div>

        {/* Severity options for 知的障害 */}
        {showSeverity && (
          <div className="mt-4 p-3 bg-galaxy rounded-xl border border-cosmic/30">
            <p className="text-sm font-semibold text-stardust mb-2">知的障害の程度</p>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeSeverity(severity === opt.value ? '' : opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    severity === opt.value
                      ? 'bg-cosmic text-white'
                      : 'bg-galaxy-light text-moon'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <NextButton onClick={onNext} />
    </div>
  );
}

/* ====== Step 5: Child Traits ====== */

function Step5Traits({
  selected,
  onChange,
  onNext,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-stardust">お子さまの特性や気になる点</h2>
        <p className="text-sm text-moon mt-1">
          あてはまるものを選んでください。あとから変更できます。
        </p>
      </div>

      <div className="max-h-[55vh] overflow-y-auto pb-20">
        <CategorizedChips
          categories={TRAIT_CATEGORIES}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      <NextButton onClick={onNext} />
    </div>
  );
}

/* ====== Step 6: Facilities ====== */

function Step6Facilities({
  selected,
  onChange,
  onNext,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-stardust">通っている施設を教えてください</h2>
        <p className="text-sm text-moon mt-1">複数選択できます</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FACILITY_OPTIONS.map((item) => (
          <ToggleChip
            key={item.value}
            label={item.label}
            selected={selected.includes(item.value)}
            onToggle={() => toggle(item.value)}
          />
        ))}
      </div>

      <NextButton onClick={onNext} />
    </div>
  );
}

/* ====== Step 7: Completion ====== */

function Step7Complete({
  error,
  saving,
  onFinish,
}: {
  error: string;
  saving: boolean;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-12">
      <Mogura expression="excited" size={160} />

      <h2 className="text-2xl font-bold text-stardust">準備ができました!</h2>
      <p className="text-base text-moon">さっそく始めましょう</p>

      {error && (
        <p className="w-full text-sm text-supernova text-center">{error}</p>
      )}

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
