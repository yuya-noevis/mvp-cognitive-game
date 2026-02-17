'use client';

import React from 'react';

export type LunaExpression = 'happy' | 'excited' | 'thinking' | 'encouraging' | 'sleeping' | 'surprised';
export type LunaPose = 'standing' | 'waving' | 'jumping' | 'sitting';

interface LunaProps {
  expression?: LunaExpression;
  pose?: LunaPose;
  size?: number;
  className?: string;
  animate?: boolean;
  speechBubble?: string;
}

/**
 * Luna — 宇宙のレッサーパンダマスコット
 *
 * 2〜2.5頭身のデフォルメキャラ。
 * 丸い体、大きな瞳、宇宙飛行士のヘルメット要素。
 * 安心感・攻撃性ゼロ・子供が怖がらない設計。
 */
export default function Luna({
  expression = 'happy',
  pose = 'standing',
  size = 120,
  className = '',
  animate = true,
  speechBubble,
}: LunaProps) {
  const animClass = animate ? getAnimationClass(pose) : '';

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {speechBubble && (
        <div
          className="relative mb-2 px-4 py-2 rounded-2xl text-sm font-medium animate-fade-in-up max-w-[200px] text-center"
          style={{
            background: 'rgba(42, 42, 90, 0.85)',
            color: '#F0F0FF',
            border: '1.5px solid rgba(108, 60, 225, 0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {speechBubble}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
            style={{
              background: 'rgba(42, 42, 90, 0.85)',
              borderRight: '1.5px solid rgba(108, 60, 225, 0.3)',
              borderBottom: '1.5px solid rgba(108, 60, 225, 0.3)',
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
        <ellipse cx="60" cy="112" rx="28" ry="5" fill="#6C3CE1" opacity={0.15} />

        {/* Body */}
        <LunaBody pose={pose} />

        {/* Face */}
        <LunaFace expression={expression} />

        {/* Accessories */}
        {pose === 'waving' && <LunaWavingArm />}
        {pose === 'jumping' && <LunaJumpSparkles />}
      </svg>
    </div>
  );
}

function getAnimationClass(pose: LunaPose): string {
  switch (pose) {
    case 'waving': return 'animate-mascot-wave';
    case 'jumping': return 'animate-mascot-jump';
    case 'sitting': return 'animate-gentle-pulse';
    default: return 'animate-float';
  }
}

/** Red panda body — round, fluffy, warm */
function LunaBody({ pose }: { pose: LunaPose }) {
  const bodyY = pose === 'jumping' ? -4 : 0;

  return (
    <g transform={`translate(0, ${bodyY})`}>
      {/* Tail - behind body */}
      <path
        d="M28 80 Q18 70, 15 58 Q12 48, 20 45 Q25 43, 28 50 Q30 56, 32 62"
        fill="#C45A28"
        opacity={0.9}
      />
      {/* Tail rings */}
      <path d="M20 52 Q22 50, 24 52" stroke="#8B3A1A" strokeWidth="2" fill="none" opacity={0.4} />
      <path d="M22 58 Q25 55, 28 58" stroke="#8B3A1A" strokeWidth="2" fill="none" opacity={0.3} />

      {/* Main body - round red panda shape */}
      <ellipse cx="60" cy="68" rx="30" ry="32" fill="#D4643A" />

      {/* Belly - cream/lighter area */}
      <ellipse cx="60" cy="75" rx="20" ry="20" fill="#F5D6C0" opacity={0.7} />

      {/* Left ear */}
      <ellipse cx="38" cy="32" rx="10" ry="13" fill="#D4643A" transform="rotate(-10, 38, 32)" />
      <ellipse cx="38" cy="32" rx="6" ry="9" fill="#8B3A1A" opacity={0.5} transform="rotate(-10, 38, 32)" />

      {/* Right ear */}
      <ellipse cx="82" cy="32" rx="10" ry="13" fill="#D4643A" transform="rotate(10, 82, 32)" />
      <ellipse cx="82" cy="32" rx="6" ry="9" fill="#8B3A1A" opacity={0.5} transform="rotate(10, 82, 32)" />

      {/* Head - distinct from body */}
      <circle cx="60" cy="48" r="24" fill="#D4643A" />

      {/* Face mask - white area around eyes */}
      <ellipse cx="60" cy="50" rx="18" ry="14" fill="#F5E8DC" opacity={0.85} />

      {/* Eye patches - dark triangles (red panda markings) */}
      <ellipse cx="46" cy="48" rx="8" ry="6" fill="#8B3A1A" opacity={0.4} transform="rotate(-5, 46, 48)" />
      <ellipse cx="74" cy="48" rx="8" ry="6" fill="#8B3A1A" opacity={0.4} transform="rotate(5, 74, 48)" />

      {/* Space helmet visor hint - subtle arc */}
      <path
        d="M36 38 Q60 28, 84 38"
        stroke="#8B5CF6"
        strokeWidth="2"
        fill="none"
        opacity={0.3}
      />

      {/* Star accessory on head */}
      <polygon
        points="60,24 62,29 67,29 63,32 65,37 60,34 55,37 57,32 53,29 58,29"
        fill="#FFD43B"
        opacity={0.9}
      />

      {/* Left foot */}
      <ellipse cx="46" cy="98" rx="10" ry="6" fill="#8B3A1A" />

      {/* Right foot */}
      <ellipse cx="74" cy="98" rx="10" ry="6" fill="#8B3A1A" />

      {/* Left arm */}
      <ellipse cx="32" cy="70" rx="7" ry="10" fill="#C45A28" transform="rotate(15, 32, 70)" />

      {/* Right arm */}
      <ellipse cx="88" cy="70" rx="7" ry="10" fill="#C45A28" transform="rotate(-15, 88, 70)" />
    </g>
  );
}

/** Luna face expressions */
function LunaFace({ expression }: { expression: LunaExpression }) {
  return (
    <g>
      {/* Cheek blush - always present, pink */}
      <circle cx="42" cy="56" r="5" fill="#FF6B9D" opacity={0.25} />
      <circle cx="78" cy="56" r="5" fill="#FF6B9D" opacity={0.25} />

      {/* Nose - tiny dark triangle */}
      <circle cx="60" cy="53" r="2.5" fill="#2D1810" />

      {/* Eyes */}
      <LunaEyes expression={expression} />

      {/* Mouth */}
      <LunaMouth expression={expression} />
    </g>
  );
}

function LunaEyes({ expression }: { expression: LunaExpression }) {
  switch (expression) {
    case 'happy':
      return (
        <>
          <path d="M46 48 C48 44, 54 44, 56 48" stroke="#2D1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M64 48 C66 44, 72 44, 74 48" stroke="#2D1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    case 'excited':
      return (
        <>
          <circle cx="50" cy="46" r="6.5" fill="white" />
          <circle cx="70" cy="46" r="6.5" fill="white" />
          <circle cx="50" cy="45" r="4" fill="#2D1810" />
          <circle cx="70" cy="45" r="4" fill="#2D1810" />
          <circle cx="52" cy="43" r="2" fill="white" />
          <circle cx="72" cy="43" r="2" fill="white" />
          {/* Star sparkles */}
          <polygon points="48,40 49,42 51,42 49.5,43.5 50,45.5 48,44 46,45.5 46.5,43.5 45,42 47,42" fill="#FFD43B" opacity={0.8} />
          <polygon points="72,40 73,42 75,42 73.5,43.5 74,45.5 72,44 70,45.5 70.5,43.5 69,42 71,42" fill="#FFD43B" opacity={0.8} />
        </>
      );
    case 'thinking':
      return (
        <>
          <circle cx="50" cy="46" r="5.5" fill="white" />
          <circle cx="70" cy="46" r="5.5" fill="white" />
          <circle cx="51" cy="44" r="3.5" fill="#2D1810" />
          <circle cx="71" cy="44" r="3.5" fill="#2D1810" />
          <circle cx="52" cy="42" r="1.5" fill="white" />
          <circle cx="72" cy="42" r="1.5" fill="white" />
        </>
      );
    case 'encouraging':
      return (
        <>
          <circle cx="50" cy="46" r="5.5" fill="white" />
          <circle cx="70" cy="46" r="5.5" fill="white" />
          <circle cx="50" cy="46" r="3.5" fill="#2D1810" />
          <circle cx="70" cy="46" r="3.5" fill="#2D1810" />
          <circle cx="51.5" cy="44.5" r="1.5" fill="white" />
          <circle cx="71.5" cy="44.5" r="1.5" fill="white" />
        </>
      );
    case 'sleeping':
      return (
        <>
          <path d="M44 47 L56 47" stroke="#2D1810" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M64 47 L76 47" stroke="#2D1810" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case 'surprised':
      return (
        <>
          <circle cx="50" cy="46" r="7" fill="white" />
          <circle cx="70" cy="46" r="7" fill="white" />
          <circle cx="50" cy="47" r="4.5" fill="#2D1810" />
          <circle cx="70" cy="47" r="4.5" fill="#2D1810" />
          <circle cx="52" cy="45" r="2" fill="white" />
          <circle cx="72" cy="45" r="2" fill="white" />
        </>
      );
  }
}

function LunaMouth({ expression }: { expression: LunaExpression }) {
  switch (expression) {
    case 'happy':
      return <path d="M54 58 C57 63, 63 63, 66 58" stroke="#2D1810" strokeWidth="2" strokeLinecap="round" fill="none" />;
    case 'excited':
      return (
        <ellipse cx="60" cy="60" rx="6" ry="4.5" fill="#2D1810" opacity={0.8}>
          <animate attributeName="ry" values="4.5;5.5;4.5" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
      );
    case 'thinking':
      return <circle cx="64" cy="58" r="2.5" fill="#2D1810" opacity={0.6} />;
    case 'encouraging':
      return (
        <>
          <path d="M52 58 C56 65, 64 65, 68 58" stroke="#2D1810" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M54 58 C56 63, 64 63, 66 58" fill="#FF6B9D" opacity={0.2} />
        </>
      );
    case 'sleeping':
      return (
        <>
          <path d="M56 58 C58 61, 62 61, 64 58" stroke="#2D1810" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="82" y="36" fill="#8B5CF6" fontSize="10" fontWeight="bold" opacity={0.6}>z</text>
          <text x="88" y="28" fill="#8B5CF6" fontSize="12" fontWeight="bold" opacity={0.4}>z</text>
        </>
      );
    case 'surprised':
      return <ellipse cx="60" cy="60" rx="4" ry="5" fill="#2D1810" opacity={0.7} />;
  }
}

function LunaWavingArm() {
  return (
    <g className="animate-mascot-arm-wave" style={{ transformOrigin: '88px 70px' }}>
      <ellipse cx="94" cy="58" rx="7" ry="10" fill="#C45A28" transform="rotate(-45, 94, 58)" />
      {/* Little paw pad */}
      <circle cx="98" cy="52" r="3" fill="#F5D6C0" opacity={0.6} />
    </g>
  );
}

function LunaJumpSparkles() {
  return (
    <>
      <polygon points="28,42 30,46 34,46 31,49 32,53 28,50 24,53 25,49 22,46 26,46" fill="#FFD43B" opacity={0.7}>
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1s" repeatCount="indefinite" />
      </polygon>
      <polygon points="90,38 91.5,41 95,41 92.5,43 93.5,46 90,44.5 86.5,46 87.5,43 85,41 88.5,41" fill="#FFD43B" opacity={0.5}>
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
      </polygon>
      <circle cx="25" cy="60" r="2" fill="#8B5CF6" opacity={0.5}>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="95" cy="55" r="1.5" fill="#FF6B9D" opacity={0.4}>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.1s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

/**
 * Compact Luna face only — for inline use
 */
export function LunaFaceOnly({
  expression = 'happy',
  size = 40,
  className = '',
}: {
  expression?: LunaExpression;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="25 20 70 70"
      fill="none"
      className={className}
    >
      {/* Head */}
      <circle cx="60" cy="48" r="28" fill="#D4643A" />
      {/* Face mask */}
      <ellipse cx="60" cy="50" rx="20" ry="16" fill="#F5E8DC" opacity={0.85} />
      {/* Eye patches */}
      <ellipse cx="46" cy="48" rx="8" ry="6" fill="#8B3A1A" opacity={0.4} transform="rotate(-5, 46, 48)" />
      <ellipse cx="74" cy="48" rx="8" ry="6" fill="#8B3A1A" opacity={0.4} transform="rotate(5, 74, 48)" />
      {/* Ears */}
      <ellipse cx="38" cy="28" rx="9" ry="11" fill="#D4643A" transform="rotate(-10, 38, 28)" />
      <ellipse cx="38" cy="28" rx="5" ry="7" fill="#8B3A1A" opacity={0.5} transform="rotate(-10, 38, 28)" />
      <ellipse cx="82" cy="28" rx="9" ry="11" fill="#D4643A" transform="rotate(10, 82, 28)" />
      <ellipse cx="82" cy="28" rx="5" ry="7" fill="#8B3A1A" opacity={0.5} transform="rotate(10, 82, 28)" />
      {/* Star */}
      <polygon points="60,18 62,23 67,23 63,26 65,31 60,28 55,31 57,26 53,23 58,23" fill="#FFD43B" opacity={0.9} />
      {/* Blush */}
      <circle cx="42" cy="56" r="5" fill="#FF6B9D" opacity={0.25} />
      <circle cx="78" cy="56" r="5" fill="#FF6B9D" opacity={0.25} />
      {/* Nose */}
      <circle cx="60" cy="53" r="2.5" fill="#2D1810" />
      {/* Eyes & mouth */}
      <LunaEyes expression={expression} />
      <LunaMouth expression={expression} />
    </svg>
  );
}
