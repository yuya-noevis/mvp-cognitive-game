import type { FC } from 'react';
import { iconProps, type IconProps } from './base';

// ─── HikariCatch: 蝶・蛍・星・鳥 ───

function HikariButterfly(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 12c-2-3-6-6-8-4s0 6 3 8c1.5.8 3.2 1.2 5 1" fill="currentColor" fillOpacity={0.2} />
      <path d="M12 12c2-3 6-6 8-4s0 6-3 8c-1.5.8-3.2 1.2-5 1" fill="currentColor" fillOpacity={0.2} />
      <line x1="12" y1="8" x2="12" y2="20" />
      <path d="M10 6c-1-2-2-3-3-3" />
      <path d="M14 6c1-2 2-3 3-3" />
    </svg>
  );
}

function HikariFirefly(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity={0.3} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <line x1="12" y1="4" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="20" />
      <line x1="4" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="20" y2="12" />
      <line x1="6.34" y1="6.34" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="17.66" y2="17.66" />
      <line x1="6.34" y1="17.66" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="17.66" y2="6.34" />
    </svg>
  );
}

function HikariStar(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="currentColor"
        fillOpacity={0.3}
        stroke="currentColor"
      />
    </svg>
  );
}

function HikariBird(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M18 8c2 0 4 1 4 3s-2 3-4 3" />
      <path d="M2 11c0-4 4-7 9-7 3 0 5.5 1 7 3v4c-1.5 2-4 3-7 3-5 0-9-3-9-7z" fill="currentColor" fillOpacity={0.2} />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <path d="M5 18c1 2 4 3 7 3s6-1 7-3" />
    </svg>
  );
}

export const HikariCatchIcons: Record<string, FC<IconProps>> = {
  butterfly: HikariButterfly,
  firefly: HikariFirefly,
  star: HikariStar,
  bird: HikariBird,
};

// ─── MatteStop: 犬・猫・うさぎ・りす・旗 ───

function DogIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M10 5C8 3 5 3 5 6v3c0 2 1 4 3 5l1 1v5h2v-4h2v4h2v-5l1-1c2-1 3-3 3-5V6c0-3-3-3-5-1" fill="currentColor" fillOpacity={0.2} />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="2" ry="1.5" />
    </svg>
  );
}

function CatIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 6l3 6v8h2v-4h6v4h2v-8l3-6-4 2H8L4 6z" fill="currentColor" fillOpacity={0.2} />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      <path d="M10 14c.5.5 1.5 1 2 1s1.5-.5 2-1" />
      <line x1="7" y1="12" x2="3" y2="11" />
      <line x1="7" y1="13" x2="3" y2="14" />
      <line x1="17" y1="12" x2="21" y2="11" />
      <line x1="17" y1="13" x2="21" y2="14" />
    </svg>
  );
}

function RabbitIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <ellipse cx="12" cy="15" rx="5" ry="6" fill="currentColor" fillOpacity={0.2} />
      <ellipse cx="9" cy="5" rx="2" ry="5" fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
      <ellipse cx="15" cy="5" rx="2" ry="5" fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
      <ellipse cx="12" cy="16" rx="1.5" ry="1" />
    </svg>
  );
}

function SquirrelIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <ellipse cx="10" cy="14" rx="5" ry="6" fill="currentColor" fillOpacity={0.2} />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <path d="M15 8c3-3 6-1 5 3s-4 6-4 6" fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
      <path d="M7 7c-1-3 1-5 3-4" />
    </svg>
  );
}

function StopFlagIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
            fill="currentColor" fillOpacity={0.25} />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export const MatteStopIcons: Record<string, FC<IconProps>> = {
  dog: DogIcon,
  cat: CatIcon,
  rabbit: RabbitIcon,
  squirrel: SquirrelIcon,
  flag: StopFlagIcon,
};

// ─── KimochiYomitori: 6表情 ───

function FaceHappy(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M8 14c1.5 2 6.5 2 8 0" />
    </svg>
  );
}

function FaceSad(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M8 17c1.5-2 6.5-2 8 0" />
    </svg>
  );
}

function FaceAngry(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="11" r="1.2" fill="currentColor" />
      <circle cx="15" cy="11" r="1.2" fill="currentColor" />
      <path d="M7 8l4 2" />
      <path d="M17 8l-4 2" />
      <path d="M9 16h6" />
    </svg>
  );
}

function FaceSurprised(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="2" />
    </svg>
  );
}

function FaceScared(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <path d="M8 16c1.5 1 6.5 1 8 0" />
      <path d="M7 7l3 1" />
      <path d="M17 7l-3 1" />
    </svg>
  );
}

function FaceDisgusted(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8 15c1 1 3 1 4 0" />
      <path d="M7 8l4 1" />
    </svg>
  );
}

export const KimochiYomitoriIcons: Record<string, FC<IconProps>> = {
  happy: FaceHappy,
  sad: FaceSad,
  angry: FaceAngry,
  surprised: FaceSurprised,
  scared: FaceScared,
  disgusted: FaceDisgusted,
};

// ─── 共通：カラードット（OboeteMatch, TsumitageTower, TouchDeGo用） ───

export function ColorDotIcon({ color, ...props }: IconProps & { color: string }) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" fill={color} stroke={color} strokeWidth={1} />
    </svg>
  );
}
