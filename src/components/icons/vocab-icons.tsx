import { iconProps, type IconProps } from './base';

/**
 * 語彙アイコン - ことばキャッチ用オリジナルSVGイラスト
 * 30個の語彙に対応するシンプルで認識しやすいイラスト
 */

// === 基本名詞 (basic_noun) ===

export function DogIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="10" r="6" fill="currentColor" fillOpacity={0.15} />
      <circle cx="12" cy="10" r="6" />
      <circle cx="10" cy="9" r="1" fill="currentColor" />
      <circle cx="14" cy="9" r="1" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="2" ry="1.5" fill="currentColor" fillOpacity={0.3} />
      <path d="M5 7C3 4 4 1 6 2l2 3" />
      <path d="M19 7c2-3 1-6-1-5l-2 3" />
      <path d="M10 13c.5.5 1.5.8 2 .8s1.5-.3 2-.8" />
      <path d="M8 17v4" /><path d="M16 17v4" />
      <rect x="7" y="14" width="10" height="5" rx="3" fill="currentColor" fillOpacity={0.15} />
      <rect x="7" y="14" width="10" height="5" rx="3" />
    </svg>
  );
}

export function CatIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="11" r="6" fill="currentColor" fillOpacity={0.15} />
      <circle cx="12" cy="11" r="6" />
      <path d="M6 6L8 2l3 3" />
      <path d="M18 6l-2-4-3 3" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
      <path d="M11 12.5l1 .5 1-.5" />
      <path d="M3 11h3" /><path d="M18 11h3" />
      <path d="M3 9l3 1" /><path d="M18 9l3-1" />
      <ellipse cx="12" cy="18" rx="4" ry="3" fill="currentColor" fillOpacity={0.15} />
      <ellipse cx="12" cy="18" rx="4" ry="3" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3c-1-1-3-1-3 0" />
      <path d="M12 2v4" />
      <path d="M17 8c3 2 3 7 1 10s-4 4-6 4-4-1-6-4-2-8 1-10c2-1.5 4-1 5-0.5 1-.5 3-1 5 .5z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M17 8c3 2 3 7 1 10s-4 4-6 4-4-1-6-4-2-8 1-10c2-1.5 4-1 5-0.5 1-.5 3-1 5 .5z" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 17h14v-5l-2-4H7L5 12v5z" fill="currentColor" fillOpacity={0.15} />
      <path d="M5 17h14v-5l-2-4H7L5 12v5z" />
      <circle cx="8" cy="17" r="2" fill="currentColor" fillOpacity={0.3} />
      <circle cx="8" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" fill="currentColor" fillOpacity={0.3} />
      <circle cx="16" cy="17" r="2" />
      <line x1="3" y1="17" x2="5" y2="17" />
      <line x1="19" y1="17" x2="21" y2="17" />
      <path d="M7 12h10" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
      <path d="M8 7h8" /><path d="M8 11h5" />
    </svg>
  );
}

export function FlowerIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity={0.3} />
      <circle cx="12" cy="10" r="3" />
      <circle cx="12" cy="5.5" r="2.5" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <circle cx="16" cy="8" r="2.5" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <circle cx="15" cy="13" r="2.5" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <circle cx="9" cy="13" r="2.5" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <path d="M12 14v8" />
      <path d="M10 18c-2 0-3-1-3-1" /><path d="M14 18c2 0 3-1 3-1" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={0.2} />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function HouseIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" fill="currentColor" fillOpacity={0.1} />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <rect x="9" y="14" width="6" height="7" rx="1" fill="currentColor" fillOpacity={0.2} />
      <rect x="9" y="14" width="6" height="7" rx="1" />
    </svg>
  );
}

export function FishIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 12c0-4 4-7 9-7 2 0 4 1 6 3-2 2-4 3-6 3 2 0 4 1 6 3-2 2-4 3-6 3-5 0-9-3-9-7z" fill="currentColor" fillOpacity={0.15} />
      <path d="M6 12c0-4 4-7 9-7 2 0 4 1 6 3-2 2-4 3-6 3 2 0 4 1 6 3-2 2-4 3-6 3-5 0-9-3-9-7z" />
      <circle cx="13" cy="10" r="1" fill="currentColor" />
      <path d="M2 10l4 2-4 2" fill="currentColor" fillOpacity={0.2} />
      <path d="M2 10l4 2-4 2" />
    </svg>
  );
}

export function BirdIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M16 7c0-2-1-4-4-4S8 5 8 7c-3 0-5 2-5 4 0 3 3 5 6 5h6c3 0 6-2 6-5 0-2-2-4-5-4z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M16 7c0-2-1-4-4-4S8 5 8 7c-3 0-5 2-5 4 0 3 3 5 6 5h6c3 0 6-2 6-5 0-2-2-4-5-4z" />
      <circle cx="10" cy="9" r="1" fill="currentColor" />
      <path d="M14 10l2-1" />
      <path d="M7 16l-2 3" /><path d="M11 16l0 3" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function TreeIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3L6 13h4l-3 8h10l-3-8h4L12 3z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 3L6 13h4l-3 8h10l-3-8h4L12 3z" />
      <line x1="12" y1="21" x2="12" y2="23" />
    </svg>
  );
}

// === 動詞 (verb) ===

export function EatIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <line x1="7" y1="2" x2="7" y2="7" />
      <line x1="3" y1="11" x2="7" y2="22" />
      <path d="M17 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" fill="currentColor" fillOpacity={0.15} />
      <path d="M17 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" />
      <line x1="17" y1="12" x2="17" y2="22" />
    </svg>
  );
}

export function RunIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="14" cy="4" r="2" />
      <path d="M7 21l3-7" />
      <path d="M10 14l-2-4 5-1" />
      <path d="M13 9l2 4h4" />
      <path d="M17 21l-4-8" />
    </svg>
  );
}

export function SleepIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 18c0-3 2-5 7-5s7 2 7 5" />
      <circle cx="12" cy="10" r="4" fill="currentColor" fillOpacity={0.15} />
      <circle cx="12" cy="10" r="4" />
      <path d="M9.5 10h1" /><path d="M13.5 10h1" />
      <text x="18" y="7" fontSize="7" fontWeight="bold" fill="currentColor" opacity={0.5}>z</text>
      <text x="20" y="3" fontSize="8" fontWeight="bold" fill="currentColor" opacity={0.3}>z</text>
    </svg>
  );
}

export function SwimIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="6" r="2" />
      <path d="M7 13l2-3 3 2 3-2 2 3" />
      <path d="M4 18c1 0 2-1 3-1s2 1 3 1 2-1 3-1 2 1 3 1 2-1 3-1" />
      <path d="M4 22c1 0 2-1 3-1s2 1 3 1 2-1 3-1 2 1 3 1 2-1 3-1" />
    </svg>
  );
}

export function SingIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 18v-12" />
      <path d="M8 22v-4c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v4" />
      <circle cx="8" cy="6" r="4" fill="currentColor" fillOpacity={0.15} />
      <circle cx="8" cy="6" r="4" />
      <path d="M17 7c1 0 2 .5 2 1.5S18 10 17 10" />
      <path d="M19 5c2 0 3 1 3 3s-1 3-3 3" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="currentColor" fillOpacity={0.1} />
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      <line x1="15" y1="5" x2="19" y2="9" />
    </svg>
  );
}

export function GamepadIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2" y="6" width="20" height="12" rx="4" fill="currentColor" fillOpacity={0.15} />
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <line x1="6" y1="10" x2="6" y2="14" /><line x1="4" y1="12" x2="8" y2="12" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function OpenBookIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="currentColor" fillOpacity={0.1} />
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="currentColor" fillOpacity={0.1} />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

// === 形容詞 (adjective) ===

export function ElephantIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="10" cy="10" r="7" fill="currentColor" fillOpacity={0.15} />
      <circle cx="10" cy="10" r="7" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <path d="M14 12c2 0 4 1 5 3v3" />
      <circle cx="5" cy="12" r="3" fill="currentColor" fillOpacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <path d="M7 17v4" /><path d="M13 17v4" />
    </svg>
  );
}

export function AntIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="8" r="3" fill="currentColor" fillOpacity={0.15} />
      <circle cx="12" cy="8" r="3" />
      <ellipse cx="12" cy="15" rx="4" ry="5" fill="currentColor" fillOpacity={0.15} />
      <ellipse cx="12" cy="15" rx="4" ry="5" />
      <circle cx="11" cy="7" r="0.5" fill="currentColor" />
      <circle cx="13" cy="7" r="0.5" fill="currentColor" />
      <path d="M9 3l-2-2" /><path d="M15 3l2-2" />
      <path d="M8 13l-4 2" /><path d="M16 13l4 2" />
      <path d="M8 16l-3 3" /><path d="M16 16l3 3" />
    </svg>
  );
}

export function HotIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 22c-4 0-7-3-7-6 0-3.5 3-6 5-9 2 3 5 5.5 5 9 0 3-3 6-7 6z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M12 22c-4 0-7-3-7-6 0-3.5 3-6 5-9 2 3 5 5.5 5 9 0 3-3 6-7 6z" />
      <path d="M12 22c-2 0-3.5-1.5-3.5-3 0-2 1.5-3 2.5-5 1 2 2.5 3 2.5 5 0 1.5-1.5 3-3.5 3z"
        fill="currentColor" fillOpacity={0.2} />
    </svg>
  );
}

export function IceIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" fillOpacity={0.1} />
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="8" cy="8" r="1" fill="currentColor" fillOpacity={0.3} />
      <circle cx="16" cy="16" r="1" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}

export function MountainIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3l10 18H2L12 3z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 3l4 7-4-3-4 3 4-7z" fill="currentColor" fillOpacity={0.2} />
    </svg>
  );
}

export function WaveIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M2 12c2-2 4-3 6-3s4 2 6 2 4-1 6-3" />
      <path d="M2 16c2-2 4-3 6-3s4 2 6 2 4-1 6-3" />
      <path d="M2 20c2-2 4-3 6-3s4 2 6 2 4-1 6-3" />
    </svg>
  );
}

// === 抽象語 (abstract) ===

export function HappyFaceIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function StrengthIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M7 11c-1.5 0-3-1.2-3-3s1-3.5 3-3.5c1 0 2 .5 2.5 1.5" />
      <path d="M9.5 6C10 4.5 11.5 3 13.5 3s3 1 3.5 2.5" />
      <path d="M17 5.5c1 0 2.5.5 2.5 2.5S18.5 11 17 11" />
      <path d="M17 11c1.5.5 2.5 2 2.5 3.5S18 18 16 18" />
      <path d="M7 11c-1.5.5-2.5 2-2.5 3.5S6 18 8 18" />
      <path d="M8 18c-.5 1.5 0 3 2 3h4c2 0 2.5-1.5 2-3" />
    </svg>
  );
}

export function KindnessIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="currentColor" fillOpacity={0.15} />
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <path d="M12 8l.5 3h2l-1.5 2 .5 3-1.5-1.5L10.5 16l.5-3-1.5-2h2z" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}

export function FriendsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="9" cy="7" r="3" fill="currentColor" fillOpacity={0.15} />
      <circle cx="9" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" fill="currentColor" fillOpacity={0.15} />
      <circle cx="16" cy="7" r="3" />
      <path d="M2 21v-2c0-2.2 1.8-4 4-4h5" fill="currentColor" fillOpacity={0.1} />
      <path d="M2 21v-2c0-2.2 1.8-4 4-4h5" />
      <path d="M13 21v-2c0-2.2 1.8-4 4-4h1c2.2 0 4 1.8 4 4v2" fill="currentColor" fillOpacity={0.1} />
      <path d="M13 21v-2c0-2.2 1.8-4 4-4h1c2.2 0 4 1.8 4 4v2" />
    </svg>
  );
}

// === Word → Icon mapping ===

import type { FC } from 'react';

const VOCAB_ICON_MAP: Record<string, FC<IconProps>> = {
  'いぬ': DogIcon,
  'ねこ': CatIcon,
  'りんご': AppleIcon,
  'くるま': CarIcon,
  'ほん': BookIcon,
  'はな': FlowerIcon,
  'おひさま': SunIcon,
  'おうち': HouseIcon,
  'さかな': FishIcon,
  'とり': BirdIcon,
  'つき': MoonIcon,
  'き': TreeIcon,
  'たべる': EatIcon,
  'はしる': RunIcon,
  'ねる': SleepIcon,
  'およぐ': SwimIcon,
  'うたう': SingIcon,
  'かく': PencilIcon,
  'あそぶ': GamepadIcon,
  'よむ': OpenBookIcon,
  'おおきい': ElephantIcon,
  'ちいさい': AntIcon,
  'あつい': HotIcon,
  'つめたい': IceIcon,
  'たかい': MountainIcon,
  'ひくい': WaveIcon,
  'しあわせ': HappyFaceIcon,
  'ゆうき': StrengthIcon,
  'やさしさ': KindnessIcon,
  'ともだち': FriendsIcon,
};

/** Get vocab icon component by word. Returns null if not found. */
export function VocabIcon({ word, ...props }: IconProps & { word: string }) {
  const Icon = VOCAB_ICON_MAP[word];
  if (!Icon) return null;
  return <Icon {...props} />;
}

export function hasVocabIcon(word: string): boolean {
  return word in VOCAB_ICON_MAP;
}
