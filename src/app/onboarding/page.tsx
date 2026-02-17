'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarField } from '@/components/map/StarField';
import Luna from '@/components/mascot/Luna';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { AvatarIcon } from '@/components/mascot/AvatarIcon';
import { AVATARS } from '@/components/mascot/avatars';
import { useRouter } from 'next/navigation';

const TOTAL_STEPS = 6;

type DisabilityType = 'ASD' | 'ADHD' | 'ID' | 'LD' | '境界知能' | 'その他';
type Severity = '軽度' | '中度' | '重度' | 'わからない';
type Trait = '感覚過敏' | '多動' | '不注意' | 'こだわり' | '不安が強い' | '言語遅れ';

interface OnboardingData {
  email: string;
  password: string;
  role: 'parent' | 'supporter' | null;
  childName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  disabilities: DisabilityType[];
  severity: Severity | null;
  traits: Trait[];
  avatarId: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    email: '',
    password: '',
    role: null,
    childName: '',
    birthYear: 2021,
    birthMonth: 1,
    birthDay: 1,
    disabilities: [],
    severity: null,
    traits: [],
    avatarId: 'avatar_01',
  });

  const progress = (step + 1) / TOTAL_STEPS;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else {
      // Onboarding complete
      router.push('/select');
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-space relative overflow-hidden">
      <StarField count={80} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 pt-12 pb-2"
           style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.95) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={back} className="tap-target flex-shrink-0" style={{ color: '#B8B8D0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <CosmicProgressBar progress={progress} className="flex-1" />
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            {step === 0 && (
              <Step1Email
                email={data.email}
                password={data.password}
                onChange={(email, password) => setData({ ...data, email, password })}
                onNext={next}
              />
            )}
            {step === 1 && (
              <Step2Role
                role={data.role}
                onChange={(role) => setData({ ...data, role })}
                onNext={next}
              />
            )}
            {step === 2 && (
              <Step3ChildName
                name={data.childName}
                onChange={(childName) => setData({ ...data, childName })}
                onNext={next}
              />
            )}
            {step === 3 && (
              <Step4Birthday
                year={data.birthYear}
                month={data.birthMonth}
                day={data.birthDay}
                onChange={(y, m, d) => setData({ ...data, birthYear: y, birthMonth: m, birthDay: d })}
                onNext={next}
              />
            )}
            {step === 4 && (
              <Step5Disability
                disabilities={data.disabilities}
                severity={data.severity}
                traits={data.traits}
                onChange={(disabilities, severity, traits) =>
                  setData({ ...data, disabilities, severity, traits })
                }
                onNext={next}
              />
            )}
            {step === 5 && (
              <Step6Avatar
                avatarId={data.avatarId}
                onChange={(avatarId) => setData({ ...data, avatarId })}
                onNext={next}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ====== Step Components ====== */

function Step1Email({
  email, password, onChange, onNext,
}: {
  email: string; password: string;
  onChange: (email: string, password: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Luna expression="encouraging" pose="waving" size={100} speechBubble="はじめまして！" />

      <div className="w-full flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value, password)}
          placeholder="メールアドレス"
          className="w-full h-14 px-5 rounded-2xl text-base font-medium"
          style={{
            background: 'rgba(42, 42, 90, 0.6)',
            border: '2px solid rgba(108, 60, 225, 0.3)',
            color: '#F0F0FF',
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => onChange(email, e.target.value)}
          placeholder="パスワード"
          className="w-full h-14 px-5 rounded-2xl text-base font-medium"
          style={{
            background: 'rgba(42, 42, 90, 0.6)',
            border: '2px solid rgba(108, 60, 225, 0.3)',
            color: '#F0F0FF',
          }}
        />
      </div>

      <CosmicButton
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!email || !password}
        onClick={onNext}
      >
        つぎへ
      </CosmicButton>
    </div>
  );
}

function Step2Role({
  role, onChange, onNext,
}: {
  role: 'parent' | 'supporter' | null;
  onChange: (role: 'parent' | 'supporter') => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-center" style={{ color: '#F0F0FF' }}>
        あなたは？
      </h2>

      <div className="flex gap-4 w-full">
        {/* Parent */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange('parent')}
          className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl"
          style={{
            background: role === 'parent'
              ? 'rgba(108, 60, 225, 0.25)'
              : 'rgba(42, 42, 90, 0.4)',
            border: role === 'parent'
              ? '2px solid #6C3CE1'
              : '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <span className="text-4xl">🏠</span>
          <span className="text-sm font-bold" style={{ color: '#F0F0FF' }}>おやです</span>
        </motion.button>

        {/* Supporter */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange('supporter')}
          className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl"
          style={{
            background: role === 'supporter'
              ? 'rgba(78, 205, 196, 0.25)'
              : 'rgba(42, 42, 90, 0.4)',
            border: role === 'supporter'
              ? '2px solid #4ECDC4'
              : '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <span className="text-4xl">💛</span>
          <span className="text-sm font-bold" style={{ color: '#F0F0FF' }}>しえんしゃです</span>
        </motion.button>
      </div>

      <CosmicButton variant="primary" size="lg" className="w-full" disabled={!role} onClick={onNext}>
        つぎへ
      </CosmicButton>
    </div>
  );
}

function Step3ChildName({
  name, onChange, onNext,
}: {
  name: string;
  onChange: (name: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Luna expression="happy" pose="standing" size={90} speechBubble="おともだちの なまえは？" />

      <input
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="なまえ"
        className="w-full h-16 px-5 rounded-2xl text-xl font-bold text-center"
        style={{
          background: 'rgba(42, 42, 90, 0.6)',
          border: '2px solid rgba(108, 60, 225, 0.3)',
          color: '#F0F0FF',
        }}
      />

      <CosmicButton variant="primary" size="lg" className="w-full" disabled={!name} onClick={onNext}>
        つぎへ
      </CosmicButton>
    </div>
  );
}

function Step4Birthday({
  year, month, day, onChange, onNext,
}: {
  year: number; month: number; day: number;
  onChange: (y: number, m: number, d: number) => void;
  onNext: () => void;
}) {
  const years = Array.from({ length: 6 }, (_, i) => 2019 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-center" style={{ color: '#F0F0FF' }}>
        うまれた ひ
      </h2>

      <div className="flex gap-3 w-full">
        {/* Year */}
        <select
          value={year}
          onChange={(e) => onChange(Number(e.target.value), month, day)}
          className="flex-1 h-14 rounded-2xl text-center text-base font-bold"
          style={{
            background: 'rgba(42, 42, 90, 0.6)',
            border: '2px solid rgba(108, 60, 225, 0.3)',
            color: '#F0F0FF',
          }}
        >
          {years.map(y => <option key={y} value={y}>{y}ねん</option>)}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value), day)}
          className="flex-1 h-14 rounded-2xl text-center text-base font-bold"
          style={{
            background: 'rgba(42, 42, 90, 0.6)',
            border: '2px solid rgba(108, 60, 225, 0.3)',
            color: '#F0F0FF',
          }}
        >
          {months.map(m => <option key={m} value={m}>{m}がつ</option>)}
        </select>

        {/* Day */}
        <select
          value={day}
          onChange={(e) => onChange(year, month, Number(e.target.value))}
          className="flex-1 h-14 rounded-2xl text-center text-base font-bold"
          style={{
            background: 'rgba(42, 42, 90, 0.6)',
            border: '2px solid rgba(108, 60, 225, 0.3)',
            color: '#F0F0FF',
          }}
        >
          {days.map(d => <option key={d} value={d}>{d}にち</option>)}
        </select>
      </div>

      <CosmicButton variant="primary" size="lg" className="w-full" onClick={onNext}>
        つぎへ
      </CosmicButton>
    </div>
  );
}

function Step5Disability({
  disabilities, severity, traits, onChange, onNext,
}: {
  disabilities: DisabilityType[];
  severity: Severity | null;
  traits: Trait[];
  onChange: (d: DisabilityType[], s: Severity | null, t: Trait[]) => void;
  onNext: () => void;
}) {
  const allDisabilities: DisabilityType[] = ['ASD', 'ADHD', 'ID', 'LD', '境界知能', 'その他'];
  const allSeverities: Severity[] = ['軽度', '中度', '重度', 'わからない'];
  const allTraits: Trait[] = ['感覚過敏', '多動', '不注意', 'こだわり', '不安が強い', '言語遅れ'];

  const toggleDisability = (d: DisabilityType) => {
    const next = disabilities.includes(d) ? disabilities.filter(x => x !== d) : [...disabilities, d];
    onChange(next, severity, traits);
  };

  const toggleTrait = (t: Trait) => {
    const next = traits.includes(t) ? traits.filter(x => x !== t) : [...traits, t];
    onChange(disabilities, severity, next);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-lg font-bold text-center" style={{ color: '#F0F0FF' }}>
        お子さまのことを おしえてください
      </h2>
      <p className="text-xs text-center" style={{ color: '#8888AA' }}>
        あとからいつでも変更できます（任意）
      </p>

      {/* Disability chips */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: '#B8B8D0' }}>しょうがいの しゅるい</p>
        <div className="flex flex-wrap gap-2">
          {allDisabilities.map(d => (
            <button
              key={d}
              onClick={() => toggleDisability(d)}
              className="px-4 py-2 rounded-full text-sm font-bold"
              style={{
                background: disabilities.includes(d) ? 'rgba(108, 60, 225, 0.3)' : 'rgba(42, 42, 90, 0.4)',
                border: disabilities.includes(d) ? '2px solid #6C3CE1' : '2px solid rgba(255,255,255,0.1)',
                color: disabilities.includes(d) ? '#8B5CF6' : '#B8B8D0',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      {disabilities.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: '#B8B8D0' }}>ていど</p>
          <div className="flex flex-wrap gap-2">
            {allSeverities.map(s => (
              <button
                key={s}
                onClick={() => onChange(disabilities, s, traits)}
                className="px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: severity === s ? 'rgba(78, 205, 196, 0.3)' : 'rgba(42, 42, 90, 0.4)',
                  border: severity === s ? '2px solid #4ECDC4' : '2px solid rgba(255,255,255,0.1)',
                  color: severity === s ? '#7EDDD6' : '#B8B8D0',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Traits */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: '#B8B8D0' }}>とくせい</p>
        <div className="flex flex-wrap gap-2">
          {allTraits.map(t => (
            <button
              key={t}
              onClick={() => toggleTrait(t)}
              className="px-4 py-2 rounded-full text-sm font-bold"
              style={{
                background: traits.includes(t) ? 'rgba(255, 212, 59, 0.2)' : 'rgba(42, 42, 90, 0.4)',
                border: traits.includes(t) ? '2px solid #FFD43B' : '2px solid rgba(255,255,255,0.1)',
                color: traits.includes(t) ? '#FFE066' : '#B8B8D0',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <CosmicButton variant="primary" size="lg" className="w-full" onClick={onNext}>
        つぎへ
      </CosmicButton>

      <button onClick={onNext} className="text-sm font-medium" style={{ color: '#8888AA' }}>
        スキップ
      </button>
    </div>
  );
}

function Step6Avatar({
  avatarId, onChange, onNext,
}: {
  avatarId: string;
  onChange: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Luna expression="excited" pose="jumping" size={90} speechBubble="アバターを えらんでね！" />

      <div className="grid grid-cols-5 gap-3">
        {AVATARS.map((avatar) => (
          <motion.button
            key={avatar.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(avatar.id)}
          >
            <AvatarIcon
              avatar={avatar}
              size={56}
              selected={avatarId === avatar.id}
            />
          </motion.button>
        ))}
      </div>

      <CosmicButton variant="star" size="lg" className="w-full" onClick={onNext}>
        ぼうけん スタート！
      </CosmicButton>
    </div>
  );
}
