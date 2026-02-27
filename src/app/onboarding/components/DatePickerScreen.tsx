'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Mogura from '@/components/mascot/Mogura';
import type { ScreenDef } from '../types';
import { StickyNextButton } from './StickyNextButton';

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
      {/* Gradient overlays */}
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
        {/* Top padding */}
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
              {item}
              {suffix}
            </span>
          </div>
        ))}
        {/* Bottom padding */}
        {Array.from({ length: PADDING_COUNT }).map((_, i) => (
          <div key={`b${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  );
}

export function DatePickerScreen({
  screen,
  birthYear,
  birthMonth,
  birthDay,
  onChange,
  onNext,
}: {
  screen: ScreenDef;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  onChange: (year: number, month: number, day: number) => void;
  onNext: () => void;
}) {
  const age = computeAge(birthYear, birthMonth, birthDay);

  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
        )}
      </div>

      {/* Drum roll pickers */}
      <div className="w-full relative">
        {/* Selection band */}
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
            value={birthYear}
            onChange={(v) => onChange(v, birthMonth, birthDay)}
            suffix="年"
          />
          <DrumColumn
            items={MONTHS}
            value={birthMonth}
            onChange={(v) => onChange(birthYear, v, birthDay)}
            suffix="月"
          />
          <DrumColumn
            items={DAYS}
            value={birthDay}
            onChange={(v) => onChange(birthYear, birthMonth, v)}
            suffix="日"
          />
        </div>
      </div>

      {/* Computed age display */}
      <div className="text-center">
        <span className="text-2xl font-bold text-cosmic">{age}</span>
        <span className="text-lg text-moon ml-1">歳</span>
      </div>

      <StickyNextButton label="つぎへ" disabled={false} onClick={onNext} />
    </div>
  );
}
