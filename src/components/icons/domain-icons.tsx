import type { FC } from 'react';
import { iconProps, type IconProps } from './base';
import type { CognitiveDomain } from '@/types';

/** 蝶 - attention */
export function ButterflyIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 12c-2-3-6-6-8-4s0 6 3 8c1.5.8 3.2 1.2 5 1" />
      <path d="M12 12c2-3 6-6 8-4s0 6-3 8c-1.5.8-3.2 1.2-5 1" />
      <path d="M12 12c-1.5 2-4 5-2.5 6.5S13 18 12 12" />
      <path d="M12 12c1.5 2 4 5 2.5 6.5S11 18 12 12" />
      <line x1="12" y1="8" x2="12" y2="20" />
      <path d="M10 6c-1-2-2-3-3-3" />
      <path d="M14 6c1-2 2-3 3-3" />
    </svg>
  );
}

/** 手 - inhibition */
export function HandStopIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M18 11V6a2 2 0 0 0-4 0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8H8a8 8 0 0 1-2-0" />
      <path d="M6 14c-1.5-1.5-2-4-2-4" />
    </svg>
  );
}

/** 宝石 - working_memory */
export function GemIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon points="12,2 22,9 12,22 2,9" />
      <polyline points="2,9 12,13 22,9" />
      <line x1="12" y1="2" x2="12" y2="13" />
      <line x1="5" y1="5" x2="9" y2="9" />
      <line x1="19" y1="5" x2="15" y2="9" />
    </svg>
  );
}

/** 箱 - memory */
export function BoxIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

/** 稲妻 - processing_speed */
export function LightningIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 矢印 - cognitive_flexibility */
export function ArrowsSwitchIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

/** 地図 - planning */
export function MapPinIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
      <path d="M8 2v16" />
      <path d="M16 6v16" />
    </svg>
  );
}

/** パズル - reasoning */
export function PuzzleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M19.5 9.5h1a2 2 0 0 1 0 4h-1" />
      <path d="M9.5 4.5v-1a2 2 0 0 1 4 0v1" />
      <path d="M4.5 14.5h-1a2 2 0 0 1 0-4h1" />
      <path d="M14.5 19.5v1a2 2 0 0 1-4 0v-1" />
      <rect x="4.5" y="4.5" width="15" height="15" rx="1" />
    </svg>
  );
}

/** 鍵 - problem_solving */
export function KeyIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="8" cy="15" r="5" />
      <path d="M11.7 11.3L21 2" />
      <path d="M17 6l4 4" />
      <path d="M15 8l2 2" />
    </svg>
  );
}

/** ダイヤ - visuospatial */
export function DiamondIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1" transform="rotate(45 12 12)" />
    </svg>
  );
}

/** 目 - perceptual */
export function EyeIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** 吹出し - language */
export function SpeechBubbleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** 握手 - social_cognition */
export function HandshakeIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20 17l-3.5-3.5" />
      <path d="M4 17l3.5-3.5" />
      <path d="M6.5 6.5L12 12l5.5-5.5" />
      <path d="M2 9l4.5-4.5a2 2 0 0 1 2.83 0L12 7.17l2.67-2.67a2 2 0 0 1 2.83 0L22 9" />
      <path d="M12 12l-4.5 4.5a2 2 0 0 0 2.83 2.83L12 17.66l1.67 1.67a2 2 0 0 0 2.83-2.83L12 12z" />
    </svg>
  );
}

/** 虹 - emotion_regulation */
export function RainbowIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M2 17a10 10 0 0 1 20 0" />
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M8 17a4 4 0 0 1 8 0" />
    </svg>
  );
}

/** 走る人 - motor_skills */
export function RunnerIcon(props: IconProps) {
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

// ドメインキー → アイコンコンポーネントの対応
const DOMAIN_ICON_MAP: Record<CognitiveDomain, FC<IconProps>> = {
  attention: ButterflyIcon,
  inhibition: HandStopIcon,
  working_memory: GemIcon,
  memory: BoxIcon,
  processing_speed: LightningIcon,
  cognitive_flexibility: ArrowsSwitchIcon,
  planning: MapPinIcon,
  reasoning: PuzzleIcon,
  problem_solving: KeyIcon,
  visuospatial: DiamondIcon,
  perceptual: EyeIcon,
  language: SpeechBubbleIcon,
  social_cognition: HandshakeIcon,
  emotion_regulation: RainbowIcon,
  motor_skills: RunnerIcon,
};

/** Helper: ドメインキーからSVGアイコンを返す */
export function DomainIcon({ domain, ...props }: IconProps & { domain: CognitiveDomain }) {
  const Icon = DOMAIN_ICON_MAP[domain];
  return <Icon {...props} />;
}
