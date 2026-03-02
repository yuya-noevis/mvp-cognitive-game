'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Mogura from '@/components/mascot/Mogura';
import { StickyNextButton } from '../../components/StickyNextButton';
import type { OnboardingV2Data } from '../types';

/* ============================================================
   BirthDateScreen — ドラムロール式生年月日ピッカー
   ============================================================ */

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_COUNT = Math.floor(VISIBLE_ITEMS / 2);

const YEARS = Array.from({ length: 2025 - 2005 + 1 }, (_, i) => 2005 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function computeAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = (today.getMonth() + 1) - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  return Math.max(0, age);
}

function DrumColumn({
  items,
  value,
  onChange,
  suffix,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSnapping = useRef(false);
  const [centerIdx, setCenterIdx] = useState(() => {
    const idx = items.indexOf(value);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTop = idx * ITEM_HEIGHT;
      setCenterIdx(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isSnapping.current) return;
    const idx = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(idx, 0), items.length - 1);
    setCenterIdx(clamped);

    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!scrollRef.current) return;
      isSnapping.current = true;
      scrollRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      onChange(items[clamped]);
      setTimeout(() => {
        isSnapping.current = false;
      }, 200);
    }, 120);
  }, [items, onChange]);

  return (
    <div className="relative flex-1" style={{ height: CONTAINER_HEIGHT }}>
      <div
        className="absolute inset-x-0 top-0 z-20 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 2,
          background: 'linear-gradient(to bottom, #0D0D2B, transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 2,
          background: 'linear-gradient(to top, #0D0D2B, transparent)',
        }}
      />
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onScroll={handleScroll}
      >
        {Array.from({ length: PADDING_COUNT }).map((_, i) => (
          <div key={`t${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
        {items.map((item, i) => (
          <div
            key={item}
            className="flex items-center justify-center select-none"
            style={{ height: ITEM_HEIGHT }}
          >
            <span
              className={`transition-all duration-150 ${
                i === centerIdx
                  ? 'text-stardust text-xl font-bold'
                  : Math.abs(i - centerIdx) === 1
                    ? 'text-moon/60 text-base'
                    : 'text-moon/30 text-sm'
              }`}
            >
              {item}{suffix}
            </span>
          </div>
        ))}
        {Array.from({ length: PADDING_COUNT }).map((_, i) => (
          <div key={`b${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  );
}

export function BirthDateScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  const age = computeAge(data.birthYear, data.birthMonth, data.birthDay);

  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="happy" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">お子さまの生年月日をおしえてください</h2>
        <p className="text-sm text-moon mt-1">お子さまに合った体験をお届けします</p>
      </div>

      <div className="w-full relative">
        <div
          className="absolute inset-x-0 z-10 pointer-events-none rounded-xl"
          style={{
            top: ITEM_HEIGHT * PADDING_COUNT,
            height: ITEM_HEIGHT,
            background: 'rgba(108, 60, 225, 0.15)',
            borderTop: '1px solid rgba(108, 60, 225, 0.3)',
            borderBottom: '1px solid rgba(108, 60, 225, 0.3)',
          }}
        />
        <div className="flex gap-1">
          <DrumColumn
            items={YEARS}
            value={data.birthYear}
            onChange={(v) => onUpdate({ birthYear: v })}
            suffix="年"
          />
          <DrumColumn
            items={MONTHS}
            value={data.birthMonth}
            onChange={(v) => onUpdate({ birthMonth: v })}
            suffix="月"
          />
          <DrumColumn
            items={DAYS}
            value={data.birthDay}
            onChange={(v) => onUpdate({ birthDay: v })}
            suffix="日"
          />
        </div>
      </div>

      <div className="text-center">
        <span className="text-2xl font-bold text-cosmic">{age}</span>
        <span className="text-lg text-moon ml-1">歳</span>
      </div>

      <StickyNextButton label="つぎへ" disabled={false} onClick={onNext} />
    </div>
  );
}

/* ============================================================
   NameScreen — テキスト入力
   ============================================================ */

export function NameScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression="pointing" size={100} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">お子さまのおなまえは？</h2>
        <p className="text-sm text-moon mt-1">ニックネームでも大丈夫です</p>
      </div>

      <input
        type="text"
        value={data.childName}
        onChange={(e) => onUpdate({ childName: e.target.value })}
        placeholder="例: たろう"
        autoFocus
        className="w-full h-14 px-4 rounded-xl text-lg bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon text-center"
      />

      <StickyNextButton
        label="つぎへ"
        disabled={!data.childName.trim()}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   SpeechLevelScreen — シングルセレクト（アイコン付き）
   ============================================================ */

const SPEECH_OPTIONS: { label: string; value: OnboardingV2Data['speechLevel']; icon: string }[] = [
  { label: '発語なし', value: 'nonverbal', icon: '🤫' },
  { label: 'はい/いいえは伝えられる', value: 'nonverbal_yesno', icon: '👍' },
  { label: '単語は出るが文にならない', value: 'single_words', icon: '💬' },
  { label: '話せるが聞き取りにくい', value: 'partial_verbal', icon: '🗣️' },
  { label: '会話ができる', value: 'verbal', icon: '😊' },
];

export function SpeechLevelScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="encouraging" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">お子さまの発話の状態は？</h2>
      </div>

      <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-galaxy-light">
        {SPEECH_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ speechLevel: opt.value })}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${
              i > 0 ? 'border-t border-galaxy-light' : ''
            } ${
              data.speechLevel === opt.value ? 'bg-cosmic/20' : ''
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-base text-stardust flex-1 text-left">{opt.label}</span>
            {data.speechLevel === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <StickyNextButton
        label="ゲームをはじめよう！"
        disabled={!data.speechLevel}
        onClick={onNext}
      />
    </div>
  );
}
