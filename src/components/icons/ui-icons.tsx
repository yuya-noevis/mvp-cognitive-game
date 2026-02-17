import { iconProps, type IconProps } from './base';

export function BrainIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 2a5 5 0 0 0-4.8 3.6A4 4 0 0 0 4 9.5a4 4 0 0 0 1.5 3.1A4.5 4.5 0 0 0 8 17h1v4h6v-4h1a4.5 4.5 0 0 0 2.5-4.4 4 4 0 0 0 1.5-3.1 4 4 0 0 0-3.2-3.9A5 5 0 0 0 12 2z" />
      <path d="M12 2v19" />
      <path d="M8 9h2" />
      <path d="M14 9h2" />
      <path d="M9 13c.6.6 1.8 1 3 1s2.4-.4 3-1" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" fill="currentColor" stroke="none" />
      <path d="M19 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" />
      <path d="M9 21h6" />
      <path d="M12 16v5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function MuscleIcon(props: IconProps) {
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

export function SearchIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function BackArrowIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function TimerIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3l-2 2" />
      <path d="M19 3l2 2" />
      <path d="M12 2v2" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
      <path d="M8 2v16" />
      <path d="M16 6v16" />
    </svg>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function ExportIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function FireIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 22c-4.97 0-9-2.69-9-6v-.5c0-2.79 1.37-5.22 3.43-6.72.42-.3 1.01-.08 1.1.43.28 1.59 1.16 2.52 2.37 2.74.14.03.3-.03.37-.16.63-1.16.83-2.52.7-3.89-.06-.62.54-1.06 1.06-.73 3.38 2.14 5.47 5.94 5.47 9.33v.5c0 3.31-4.03 6-9 6z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 22c-4.97 0-9-2.69-9-6v-.5c0-2.79 1.37-5.22 3.43-6.72.42-.3 1.01-.08 1.1.43.28 1.59 1.16 2.52 2.37 2.74.14.03.3-.03.37-.16.63-1.16.83-2.52.7-3.89-.06-.62.54-1.06 1.06-.73 3.38 2.14 5.47 5.94 5.47 9.33v.5c0 3.31-4.03 6-9 6z" />
    </svg>
  );
}

export function SeedlingIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 22V12" />
      <path d="M12 12C12 7 7 4 3 4c0 5 4 8 9 8z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 12C12 7 7 4 3 4c0 5 4 8 9 8z" />
      <path d="M12 15c0-5 5-8 9-8-1 5-5 8-9 8z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 15c0-5 5-8 9-8-1 5-5 8-9 8z" />
    </svg>
  );
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="4" r="2" />
      <path d="M4 8l4 1h8l4-1" />
      <path d="M12 9v4" />
      <path d="M8 21l4-8 4 8" />
    </svg>
  );
}

export function MicroscopeIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.65l7.64-7.65.78-.77a5.4 5.4 0 0 0 0-7.65z" />
      <path d="M3.5 12h3l2-4 3 8 2-4h3" />
    </svg>
  );
}

// === Duolingo-style Icons ===

export function CrownIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M2 20h20L19 8l-4 5-3-6-3 6-4-5-1 12z" fill="currentColor" fillOpacity={0.2} />
      <path d="M2 20h20L19 8l-4 5-3-6-3 6-4-5-1 12z" />
      <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}

export function GemHexIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="currentColor" fillOpacity={0.2} />
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
      <path d="M12 7l4 2.5v5L12 17l-4-2.5v-5L12 7z" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}

export function LightningBoltIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChestIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2" y="10" width="20" height="10" rx="2" fill="currentColor" fillOpacity={0.2} />
      <rect x="2" y="10" width="20" height="10" rx="2" />
      <path d="M2 14h20" />
      <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" fill="currentColor" fillOpacity={0.15} />
      <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <rect x="10" y="12" width="4" height="4" rx="1" fill="currentColor" fillOpacity={0.3} />
      <rect x="10" y="12" width="4" height="4" rx="1" />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <rect x="4" y="4" width="5" height="16" rx="2" fill="currentColor" fillOpacity={0.15} />
      <rect x="4" y="4" width="5" height="16" rx="2" />
      <rect x="15" y="4" width="5" height="16" rx="2" fill="currentColor" fillOpacity={0.15} />
      <rect x="15" y="4" width="5" height="16" rx="2" />
      <rect x="2" y="7" width="3" height="10" rx="1" fill="currentColor" fillOpacity={0.1} />
      <rect x="2" y="7" width="3" height="10" rx="1" />
      <rect x="19" y="7" width="3" height="10" rx="1" fill="currentColor" fillOpacity={0.1} />
      <rect x="19" y="7" width="3" height="10" rx="1" />
    </svg>
  );
}

export function HomeFilledIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" fill="currentColor" fillOpacity={0.2} />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

export function MoreDotsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
