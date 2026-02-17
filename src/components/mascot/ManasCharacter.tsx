'use client';

import React from 'react';

export type MascotExpression = 'happy' | 'excited' | 'thinking' | 'encouraging' | 'sleeping' | 'surprised';
export type MascotPose = 'standing' | 'waving' | 'jumping' | 'sitting';

interface ManasCharacterProps {
  expression?: MascotExpression;
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
  speechBubble?: string;
}

/**
 * Manas - オリジナルマスコットキャラクター
 *
 * 丸くてやわらかい、ティール色の生き物。
 * 大きな目と小さな手足を持ち、子どもに安心感を与えるデザイン。
 * 感覚過敏に配慮: 穏やかな色、シンプルな形、なめらかなアニメーション
 */
export function ManasCharacter({
  expression = 'happy',
  pose = 'standing',
  size = 120,
  className = '',
  animate = true,
  speechBubble,
}: ManasCharacterProps) {
  const animClass = animate ? getAnimationClass(pose) : '';

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {speechBubble && (
        <div
          className="relative mb-2 px-4 py-2 rounded-2xl text-sm font-medium animate-fade-in-up max-w-[200px] text-center"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1.5px solid var(--color-border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {speechBubble}
          {/* Speech bubble tail */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
            style={{
              background: 'var(--color-surface)',
              borderRight: '1.5px solid var(--color-border-light)',
              borderBottom: '1.5px solid var(--color-border-light)',
            }}
          />
        </div>
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        className={animClass}
      >
        {/* Shadow */}
        <ellipse cx="60" cy="110" rx="30" ry="6" fill="#E8DDD0" opacity={0.4} />

        {/* Body */}
        <MascotBody pose={pose} />

        {/* Face */}
        <MascotFace expression={expression} />

        {/* Accessories based on pose */}
        {pose === 'waving' && <WavingArm />}
        {pose === 'jumping' && <JumpSparkles />}
      </svg>
    </div>
  );
}

function getAnimationClass(pose: MascotPose): string {
  switch (pose) {
    case 'waving': return 'animate-mascot-wave';
    case 'jumping': return 'animate-mascot-jump';
    case 'sitting': return 'animate-gentle-pulse';
    default: return 'animate-float';
  }
}

/** Body shape - round, soft, friendly */
function MascotBody({ pose }: { pose: MascotPose }) {
  const bodyY = pose === 'jumping' ? -4 : 0;
  const squish = pose === 'jumping' ? 'scale(1, 0.95)' : 'scale(1, 1)';

  return (
    <g transform={`translate(0, ${bodyY})`} style={{ transform: squish, transformOrigin: '60px 70px' }}>
      {/* Main body - round teal shape */}
      <ellipse cx="60" cy="65" rx="32" ry="35" fill="#4AADA4" />

      {/* Belly - lighter area */}
      <ellipse cx="60" cy="72" rx="22" ry="22" fill="#7FCAC3" opacity={0.5} />

      {/* Left ear */}
      <ellipse cx="38" cy="36" rx="10" ry="12" fill="#4AADA4" transform="rotate(-15, 38, 36)" />
      <ellipse cx="38" cy="36" rx="6" ry="8" fill="#7FCAC3" opacity={0.4} transform="rotate(-15, 38, 36)" />

      {/* Right ear */}
      <ellipse cx="82" cy="36" rx="10" ry="12" fill="#4AADA4" transform="rotate(15, 82, 36)" />
      <ellipse cx="82" cy="36" rx="6" ry="8" fill="#7FCAC3" opacity={0.4} transform="rotate(15, 82, 36)" />

      {/* Left foot */}
      <ellipse cx="46" cy="96" rx="10" ry="6" fill="#3A8A83" />

      {/* Right foot */}
      <ellipse cx="74" cy="96" rx="10" ry="6" fill="#3A8A83" />

      {/* Left arm (default position) */}
      <ellipse cx="30" cy="68" rx="7" ry="10" fill="#3A8A83" transform="rotate(20, 30, 68)" />

      {/* Right arm (default position) */}
      <ellipse cx="90" cy="68" rx="7" ry="10" fill="#3A8A83" transform="rotate(-20, 90, 68)" />
    </g>
  );
}

/** Face expressions */
function MascotFace({ expression }: { expression: MascotExpression }) {
  return (
    <g>
      {/* Cheek blush - always present */}
      <circle cx="40" cy="65" r="6" fill="#E8866A" opacity={0.2} />
      <circle cx="80" cy="65" r="6" fill="#E8866A" opacity={0.2} />

      {/* Eyes */}
      <MascotEyes expression={expression} />

      {/* Mouth */}
      <MascotMouth expression={expression} />
    </g>
  );
}

function MascotEyes({ expression }: { expression: MascotExpression }) {
  switch (expression) {
    case 'happy':
      return (
        <>
          {/* Happy curved eyes */}
          <path d="M45 56 C47 52, 53 52, 55 56" stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M65 56 C67 52, 73 52, 75 56" stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    case 'excited':
      return (
        <>
          {/* Big sparkly eyes */}
          <circle cx="48" cy="54" r="7" fill="white" />
          <circle cx="72" cy="54" r="7" fill="white" />
          <circle cx="48" cy="53" r="4.5" fill="#2D3436" />
          <circle cx="72" cy="53" r="4.5" fill="#2D3436" />
          <circle cx="50" cy="51" r="2" fill="white" />
          <circle cx="74" cy="51" r="2" fill="white" />
          {/* Star sparkles in eyes */}
          <circle cx="46" cy="50" r="1" fill="white" />
          <circle cx="70" cy="50" r="1" fill="white" />
        </>
      );
    case 'thinking':
      return (
        <>
          {/* Looking up eyes */}
          <circle cx="48" cy="54" r="6" fill="white" />
          <circle cx="72" cy="54" r="6" fill="white" />
          <circle cx="49" cy="51" r="4" fill="#2D3436" />
          <circle cx="73" cy="51" r="4" fill="#2D3436" />
          <circle cx="50" cy="49" r="1.5" fill="white" />
          <circle cx="74" cy="49" r="1.5" fill="white" />
        </>
      );
    case 'encouraging':
      return (
        <>
          {/* Warm open eyes */}
          <circle cx="48" cy="54" r="6" fill="white" />
          <circle cx="72" cy="54" r="6" fill="white" />
          <circle cx="48" cy="54" r="4" fill="#2D3436" />
          <circle cx="72" cy="54" r="4" fill="#2D3436" />
          <circle cx="49.5" cy="52.5" r="1.5" fill="white" />
          <circle cx="73.5" cy="52.5" r="1.5" fill="white" />
        </>
      );
    case 'sleeping':
      return (
        <>
          {/* Closed sleeping eyes */}
          <path d="M43 55 L53 55" stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 55 L77 55" stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case 'surprised':
      return (
        <>
          {/* Wide round eyes */}
          <circle cx="48" cy="54" r="7" fill="white" />
          <circle cx="72" cy="54" r="7" fill="white" />
          <circle cx="48" cy="55" r="5" fill="#2D3436" />
          <circle cx="72" cy="55" r="5" fill="#2D3436" />
          <circle cx="50" cy="53" r="2" fill="white" />
          <circle cx="74" cy="53" r="2" fill="white" />
        </>
      );
  }
}

function MascotMouth({ expression }: { expression: MascotExpression }) {
  switch (expression) {
    case 'happy':
      return <path d="M52 68 C55 74, 65 74, 68 68" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" fill="none" />;
    case 'excited':
      return (
        <ellipse cx="60" cy="70" rx="7" ry="5" fill="#2D3436" opacity={0.8}>
          <animate attributeName="ry" values="5;6;5" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
      );
    case 'thinking':
      return <circle cx="64" cy="70" r="3" fill="#2D3436" opacity={0.6} />;
    case 'encouraging':
      return (
        <>
          <path d="M50 68 C55 76, 65 76, 70 68" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M52 68 C55 74, 65 74, 68 68" fill="#E8866A" opacity={0.3} />
        </>
      );
    case 'sleeping':
      return (
        <>
          <path d="M55 69 C58 72, 62 72, 65 69" stroke="#2D3436" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Z letters */}
          <text x="82" y="42" fill="#9CA3AF" fontSize="10" fontWeight="bold" opacity={0.6}>z</text>
          <text x="88" y="34" fill="#9CA3AF" fontSize="12" fontWeight="bold" opacity={0.4}>z</text>
        </>
      );
    case 'surprised':
      return <ellipse cx="60" cy="72" rx="5" ry="6" fill="#2D3436" opacity={0.7} />;
  }
}

/** Waving arm overlay */
function WavingArm() {
  return (
    <g className="animate-mascot-arm-wave" style={{ transformOrigin: '90px 68px' }}>
      <ellipse cx="94" cy="55" rx="7" ry="10" fill="#3A8A83" transform="rotate(-45, 94, 55)" />
    </g>
  );
}

/** Jump sparkles */
function JumpSparkles() {
  return (
    <>
      <circle cx="30" cy="45" r="2" fill="#F0B429" opacity={0.7}>
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="40" r="1.5" fill="#F0B429" opacity={0.5}>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="25" cy="60" r="1.5" fill="#4AADA4" opacity={0.5}>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="95" cy="55" r="2" fill="#E8866A" opacity={0.4}>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.1s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

/**
 * Compact mascot face only - for inline use in headers, icons, etc.
 */
export function ManasFace({
  expression = 'happy',
  size = 40,
  className = '',
}: {
  expression?: MascotExpression;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="25 25 70 70"
      fill="none"
      className={className}
    >
      {/* Body (face area only) */}
      <ellipse cx="60" cy="60" rx="30" ry="30" fill="#4AADA4" />
      <ellipse cx="60" cy="65" rx="20" ry="18" fill="#7FCAC3" opacity={0.4} />

      {/* Left ear */}
      <ellipse cx="38" cy="36" rx="8" ry="10" fill="#4AADA4" transform="rotate(-15, 38, 36)" />
      <ellipse cx="38" cy="36" rx="5" ry="7" fill="#7FCAC3" opacity={0.4} transform="rotate(-15, 38, 36)" />

      {/* Right ear */}
      <ellipse cx="82" cy="36" rx="8" ry="10" fill="#4AADA4" transform="rotate(15, 82, 36)" />
      <ellipse cx="82" cy="36" rx="5" ry="7" fill="#7FCAC3" opacity={0.4} transform="rotate(15, 82, 36)" />

      {/* Blush */}
      <circle cx="40" cy="62" r="5" fill="#E8866A" opacity={0.2} />
      <circle cx="80" cy="62" r="5" fill="#E8866A" opacity={0.2} />

      {/* Eyes & mouth */}
      <MascotEyes expression={expression} />
      <MascotMouth expression={expression} />
    </svg>
  );
}
