'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import type { MasteryLevel, CognitiveDomain } from '@/types';
import { LockIcon, StarIcon, BackArrowIcon } from '@/components/icons';
import { ManasFace } from '@/components/mascot/ManasCharacter';

interface StageNode {
  stageNumber: number;
  domains: CognitiveDomain[];
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  highestMastery: MasteryLevel;
}

interface StageMapProps {
  stages: StageNode[];
  currentStage: number;
  onBack?: () => void;
}

/**
 * StageMap - Duolingo ABC風ステージパス
 *
 * ダークブラウン背景 + クロスハッチパターン
 * ロックノード: 暗い円 + 錠前アイコン
 * アクティブノード: マスコットが乗っている
 * ブックノード: 角丸四角
 * 点線コネクター
 */
export function StageMap({ stages, currentStage, onBack }: StageMapProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStage]);

  return (
    <div className="relative min-h-screen duo-crosshatch"
         style={{ background: 'var(--duo-path-bg, #4A3728)' }}>

      {/* Top navigation overlay */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4">
        <button
          onClick={onBack ?? (() => window.history.back())}
          className="w-12 h-12 rounded-full flex items-center justify-center tap-interactive"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <BackArrowIcon size={24} style={{ color: '#1CB0F6' }} />
        </button>

        <button
          className="w-12 h-12 rounded-full flex items-center justify-center tap-interactive"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="2" rx="1" fill="#1CB0F6" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="#1CB0F6" />
            <rect x="4" y="16" width="16" height="2" rx="1" fill="#1CB0F6" />
            <circle cx="18" cy="7" r="3" fill="#1CB0F6" />
            <circle cx="18" cy="12" r="3" fill="#1CB0F6" />
            <circle cx="18" cy="17" r="3" fill="#1CB0F6" />
          </svg>
        </button>
      </div>

      {/* Stage path */}
      <div className="w-full max-w-sm mx-auto px-4 pb-8">
        <div className="flex flex-col items-center">
          {/* Reverse: bottom-to-top path (current at bottom, locked at top) */}
          {[...stages].reverse().map((stage, index) => {
            const realIndex = stages.length - 1 - index;
            const isBook = (realIndex + 1) % 5 === 0;
            const zigzagOffset = getZigzagOffset(index);

            return (
              <div key={stage.stageNumber} className="flex flex-col items-center w-full">
                {/* Dotted connector */}
                {index > 0 && (
                  <DottedConnector
                    prevOffset={getZigzagOffset(index - 1)}
                    currentOffset={zigzagOffset}
                  />
                )}

                {/* Stage node */}
                <div
                  ref={stage.isCurrent ? currentRef : undefined}
                  className="relative"
                  style={{ transform: `translateX(${zigzagOffset}px)` }}
                >
                  {stage.isCurrent ? (
                    <CurrentNode stage={stage} />
                  ) : isBook ? (
                    <BookNode stage={stage} />
                  ) : (
                    <PathNode stage={stage} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getZigzagOffset(index: number): number {
  const positions = [0, 50, 70, 50, 0, -50, -70, -50];
  return positions[index % positions.length];
}

/** Dotted connector line between nodes */
function DottedConnector({ prevOffset, currentOffset }: { prevOffset: number; currentOffset: number }) {
  return (
    <svg width="200" height="40" viewBox="0 0 200 40" className="overflow-visible">
      <path
        d={`M${100 + prevOffset * 0.7},0 C${100 + prevOffset * 0.7},20 ${100 + currentOffset * 0.7},20 ${100 + currentOffset * 0.7},40`}
        fill="none"
        stroke="rgba(80, 60, 40, 0.4)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />
    </svg>
  );
}

/** Locked or completed path node (circle + lock icon) */
function PathNode({ stage }: { stage: StageNode }) {
  const isLocked = !stage.isUnlocked;
  const isCompleted = stage.isCompleted;
  const size = 64;

  const bgColor = isCompleted
    ? '#58CC02'
    : isLocked
      ? 'rgba(60, 42, 30, 0.75)'
      : '#58CC02';

  const borderColor = isCompleted
    ? '#46A302'
    : isLocked
      ? 'rgba(50, 35, 20, 0.85)'
      : '#46A302';

  const content = (
    <div
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: size,
        height: size,
        background: bgColor,
        border: `4px solid ${borderColor}`,
      }}
    >
      {isLocked ? (
        <LockIcon size={24} style={{ color: 'rgba(255, 255, 255, 0.35)' }} />
      ) : (
        <StarIcon size={28} style={{ color: 'white', fill: 'white', stroke: 'none' }} />
      )}
    </div>
  );

  if (stage.isUnlocked) {
    return <Link href={`/stage/${stage.stageNumber}`}>{content}</Link>;
  }
  return content;
}

/** Book/story node (rounded rectangle) */
function BookNode({ stage }: { stage: StageNode }) {
  const isLocked = !stage.isUnlocked;
  const size = 60;

  const content = (
    <div
      className="rounded-2xl flex items-center justify-center transition-all"
      style={{
        width: size,
        height: size * 1.1,
        background: isLocked ? 'rgba(60, 42, 30, 0.75)' : '#FFC800',
        border: `4px solid ${isLocked ? 'rgba(50, 35, 20, 0.85)' : '#D4A800'}`,
      }}
    >
      <LockIcon size={24} style={{ color: isLocked ? 'rgba(255, 255, 255, 0.35)' : 'white' }} />
    </div>
  );

  if (stage.isUnlocked) {
    return <Link href={`/stage/${stage.stageNumber}`}>{content}</Link>;
  }
  return content;
}

/** Current active node - mascot sitting on platform */
function CurrentNode({ stage }: { stage: StageNode }) {
  return (
    <Link href={`/stage/${stage.stageNumber}`} className="flex flex-col items-center">
      {/* Mascot on top */}
      <div className="animate-gentle-bounce mb-[-14px] z-10">
        <ManasFace expression="excited" size={56} />
      </div>

      {/* Platform circle with glow */}
      <div
        className="rounded-full flex items-center justify-center animate-progress-glow"
        style={{
          width: 76,
          height: 76,
          background: '#1CB0F6',
          border: '5px solid #1898D4',
          boxShadow: '0 4px 0 #1480B0, 0 6px 20px rgba(28, 176, 246, 0.45)',
        }}
      >
        <StarIcon size={32} style={{ color: 'white', fill: 'white', stroke: 'none' }} />
      </div>
    </Link>
  );
}
