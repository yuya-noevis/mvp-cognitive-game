'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import type { MasteryLevel, CognitiveDomain } from '@/types';
import { LockIcon, StarIcon, BackArrowIcon } from '@/components/icons';
import { LunaFaceOnly } from '@/components/mascot/Luna';

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
 * StageMap - 宇宙テーマ ステージパス
 *
 * 深宇宙背景 + 星雲パターン
 * ロックノード: 暗い円 + 鍵
 * アクティブノード: ルナが乗っている
 */
export function StageMap({ stages, currentStage, onBack }: StageMapProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStage]);

  return (
    <div className="relative min-h-screen bg-space">
      {/* Star background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className={i % 4 === 0 ? 'animate-twinkle' : ''}
            style={{
              position: 'absolute',
              left: `${(i * 43) % 100}%`,
              top: `${(i * 61) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              borderRadius: '50%',
              background: i % 7 === 0 ? '#FFD43B' : '#F0F0FF',
              opacity: 0.2 + (i % 4) * 0.1,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Top navigation overlay */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4"
           style={{ background: 'linear-gradient(180deg, rgba(13,13,43,0.9) 0%, transparent 100%)' }}>
        <button
          onClick={onBack ?? (() => window.history.back())}
          className="w-12 h-12 rounded-full flex items-center justify-center tap-interactive"
          style={{ background: 'rgba(42, 42, 90, 0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          <BackArrowIcon size={24} style={{ color: '#8B5CF6' }} />
        </button>

        <button
          className="w-12 h-12 rounded-full flex items-center justify-center tap-interactive"
          style={{ background: 'rgba(42, 42, 90, 0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="2" rx="1" fill="#8B5CF6" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="#8B5CF6" />
            <rect x="4" y="16" width="16" height="2" rx="1" fill="#8B5CF6" />
          </svg>
        </button>
      </div>

      {/* Stage path */}
      <div className="w-full max-w-sm mx-auto px-4 pb-8 relative z-10">
        <div className="flex flex-col items-center">
          {[...stages].reverse().map((stage, index) => {
            const realIndex = stages.length - 1 - index;
            const isBook = (realIndex + 1) % 5 === 0;
            const zigzagOffset = getZigzagOffset(index);

            return (
              <div key={stage.stageNumber} className="flex flex-col items-center w-full">
                {index > 0 && (
                  <DottedConnector
                    prevOffset={getZigzagOffset(index - 1)}
                    currentOffset={zigzagOffset}
                  />
                )}

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

function DottedConnector({ prevOffset, currentOffset }: { prevOffset: number; currentOffset: number }) {
  return (
    <svg width="200" height="40" viewBox="0 0 200 40" className="overflow-visible">
      <path
        d={`M${100 + prevOffset * 0.7},0 C${100 + prevOffset * 0.7},20 ${100 + currentOffset * 0.7},20 ${100 + currentOffset * 0.7},40`}
        fill="none"
        stroke="rgba(108, 60, 225, 0.3)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />
    </svg>
  );
}

function PathNode({ stage }: { stage: StageNode }) {
  const isLocked = !stage.isUnlocked;
  const isCompleted = stage.isCompleted;
  const size = 64;

  const bgColor = isCompleted
    ? 'linear-gradient(135deg, #6C3CE1, #8B5CF6)'
    : isLocked
      ? 'rgba(42, 42, 90, 0.6)'
      : 'linear-gradient(135deg, #6C3CE1, #8B5CF6)';

  const borderColor = isCompleted
    ? '#5B2CC9'
    : isLocked
      ? 'rgba(58, 58, 106, 0.8)'
      : '#5B2CC9';

  const content = (
    <div
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: size,
        height: size,
        background: bgColor,
        border: `4px solid ${borderColor}`,
        boxShadow: isLocked ? 'none' : '0 4px 12px rgba(108, 60, 225, 0.3)',
      }}
    >
      {isLocked ? (
        <LockIcon size={24} style={{ color: 'rgba(255, 255, 255, 0.25)' }} />
      ) : (
        <StarIcon size={28} style={{ color: '#FFD43B', fill: '#FFD43B', stroke: 'none' }} />
      )}
    </div>
  );

  if (stage.isUnlocked) {
    return <Link href={`/stage/${stage.stageNumber}`}>{content}</Link>;
  }
  return content;
}

function BookNode({ stage }: { stage: StageNode }) {
  const isLocked = !stage.isUnlocked;
  const size = 60;

  const content = (
    <div
      className="rounded-2xl flex items-center justify-center transition-all"
      style={{
        width: size,
        height: size * 1.1,
        background: isLocked ? 'rgba(42, 42, 90, 0.6)' : 'linear-gradient(135deg, #FFD43B, #FFE066)',
        border: `4px solid ${isLocked ? 'rgba(58, 58, 106, 0.8)' : '#E6BE35'}`,
        boxShadow: isLocked ? 'none' : '0 4px 12px rgba(255, 212, 59, 0.3)',
      }}
    >
      <LockIcon size={24} style={{ color: isLocked ? 'rgba(255, 255, 255, 0.25)' : '#1A1A40' }} />
    </div>
  );

  if (stage.isUnlocked) {
    return <Link href={`/stage/${stage.stageNumber}`}>{content}</Link>;
  }
  return content;
}

function CurrentNode({ stage }: { stage: StageNode }) {
  return (
    <Link href={`/stage/${stage.stageNumber}`} className="flex flex-col items-center">
      <div className="animate-gentle-bounce mb-[-14px] z-10">
        <LunaFaceOnly expression="excited" size={56} />
      </div>

      <div
        className="rounded-full flex items-center justify-center animate-cosmic-glow"
        style={{
          width: 76,
          height: 76,
          background: 'linear-gradient(135deg, #4ECDC4, #7EDDD6)',
          border: '5px solid #3ABBB3',
          boxShadow: '0 4px 0 #2DA8A0, 0 6px 20px rgba(78, 205, 196, 0.45)',
        }}
      >
        <StarIcon size={32} style={{ color: '#FFD43B', fill: '#FFD43B', stroke: 'none' }} />
      </div>
    </Link>
  );
}
