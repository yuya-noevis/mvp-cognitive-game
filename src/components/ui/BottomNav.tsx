'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Flat, filled SVG icons (no outlines, rounded corners)
// ---------------------------------------------------------------------------

function HomeIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {/* Roof (triangle with rounded joins) */}
      <path
        d="M12 3L2 12h3v8a1 1 0 001 1h4v-6a2 2 0 014 0v6h4a1 1 0 001-1v-8h3L12 3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path
        d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z"
      />
    </svg>
  );
}

function StarIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path
        d="M12 2l2.94 6.34L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 7.06-.93L12 2z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BottomNav
// ---------------------------------------------------------------------------

/** Routes where the nav bar should be hidden */
const HIDDEN_ROUTES = ['/onboarding', '/login', '/consent', '/play/', '/stage/', '/game/'];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on onboarding, login, play (games), stage, consent
  if (HIDDEN_ROUTES.some(r => pathname?.startsWith(r))) return null;

  const isHome = pathname === '/';
  const isLibrary = pathname?.startsWith('/library');

  // "あそぶ" tap → launch highest-need game (for MVP, default to first game)
  const handlePlay = () => {
    router.push('/play/hikari-catch');
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-around"
      style={{
        height: `calc(64px + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--color-galaxy)',
        borderTop: '1px solid var(--color-galaxy-light)',
      }}
    >
      {/* Home tab */}
      <Link
        href="/"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 pt-1"
      >
        <HomeIcon size={24} color={isHome ? '#6C3CE1' : '#B8B8D0'} />
        <span
          className="text-[10px] font-medium"
          style={{ color: isHome ? '#6C3CE1' : '#B8B8D0' }}
        >
          ホーム
        </span>
      </Link>

      {/* Play tab (center, raised circle) */}
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={handlePlay}
          className="flex flex-col items-center -mt-5"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:scale-90 transition-transform"
            style={{ background: '#6C3CE1' }}
          >
            <PlayIcon size={28} color="#FFFFFF" />
          </div>
          <span
            className="mt-1 text-[10px] font-medium"
            style={{ color: '#6C3CE1' }}
          >
            あそぶ
          </span>
        </button>
      </div>

      {/* Library tab */}
      <Link
        href="/library"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 pt-1"
      >
        <StarIcon size={24} color={isLibrary ? '#6C3CE1' : '#B8B8D0'} />
        <span
          className="text-[10px] font-medium"
          style={{ color: isLibrary ? '#6C3CE1' : '#B8B8D0' }}
        >
          きろく
        </span>
      </Link>
    </nav>
  );
}
