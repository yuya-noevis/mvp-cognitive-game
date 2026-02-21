'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useChildProfile } from '@/hooks/useChildProfile';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface BuildingDef {
  id: string;
  image: string;
  name: string;
  gameIds: string[];
}

const BUILDINGS: BuildingDef[] = [
  {
    id: 'hikari',
    image: '/assets/buildings/building-hikari.png',
    name: '\u3072\u304B\u308A\u30E9\u30DC',
    gameIds: ['hikari-catch', 'matte-stop', 'oboete-narabete'],
  },
  {
    id: 'kokoro',
    image: '/assets/buildings/building-kokoro.png',
    name: '\u3053\u3053\u308D\u30CF\u30A6\u30B9',
    gameIds: ['kimochi-yomitori', 'kimochi-stop'],
  },
  {
    id: 'hirameki',
    image: '/assets/buildings/building-hirameki.png',
    name: '\u3072\u3089\u3081\u304D\u30BF\u30EF\u30FC',
    gameIds: ['irokae-switch', 'pattern-puzzle', 'tsumitage-tower', 'meiro-tanken'],
  },
  {
    id: 'kankaku',
    image: '/assets/buildings/building-kankaku.png',
    name: '\u304B\u3093\u304B\u304F\u30C9\u30FC\u30E0',
    gameIds: ['katachi-sagashi', 'kakurenbo-katachi', 'hayawaza-touch', 'touch-de-go'],
  },
  {
    id: 'kotoba',
    image: '/assets/buildings/building-kotoba.png',
    name: '\u3053\u3068\u3070\u30E9\u30A4\u30D6\u30E9\u30EA',
    gameIds: ['kotoba-catch', 'oboete-match'],
  },
];

const GAME_DISPLAY_NAMES: Record<string, string> = {
  'hikari-catch': '\u3072\u304B\u308A\u30AD\u30E3\u30C3\u30C1',
  'matte-stop': '\u307E\u3063\u3066\uFF01\u30B9\u30C8\u30C3\u30D7',
  'oboete-narabete': '\u304A\u307C\u3048\u3066\u306A\u3089\u3079\u3066',
  'kimochi-yomitori': '\u304D\u3082\u3061\u3088\u307F\u3068\u308A',
  'kimochi-stop': '\u304D\u3082\u3061\u30B9\u30C8\u30C3\u30D7',
  'irokae-switch': '\u3044\u308D\u304B\u3048\u30B9\u30A4\u30C3\u30C1',
  'pattern-puzzle': '\u30D1\u30BF\u30FC\u30F3\u30D1\u30BA\u30EB',
  'tsumitage-tower': '\u3064\u307F\u3042\u3052\u30BF\u30EF\u30FC',
  'meiro-tanken': '\u3081\u3044\u308D\u305F\u3093\u3051\u3093',
  'katachi-sagashi': '\u304B\u305F\u3061\u3055\u304C\u3057',
  'kakurenbo-katachi': '\u304B\u304F\u308C\u3093\u307C\u30AB\u30BF\u30C1',
  'hayawaza-touch': '\u306F\u3084\u308F\u3056\u30BF\u30C3\u30C1',
  'touch-de-go': '\u30BF\u30C3\u30C1\u3067GO!',
  'kotoba-catch': '\u3053\u3068\u3070\u30AD\u30E3\u30C3\u30C1',
  'oboete-match': '\u304A\u307C\u3048\u3066\u30DE\u30C3\u30C1',
};

// For MVP all buildings are unlocked. Flip to false to enable lock styling.
const isUnlocked = true;

// ---------------------------------------------------------------------------
// Stars component (rating placeholder)
// ---------------------------------------------------------------------------

function StarRating({ count = 3 }: { count?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-star"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lock icon SVG
// ---------------------------------------------------------------------------

function LockIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-moon"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Settings gear SVG icon
// ---------------------------------------------------------------------------

function GearIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function Home() {
  const router = useRouter();
  const { child, loading, error } = useChildProfile();

  // Redirect to login if no profile found (demo mode guard)
  useEffect(() => {
    if (!loading && !child) {
      router.replace('/login');
    }
  }, [loading, child, router]);

  // Bottom sheet state
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDef | null>(null);

  // Parental long-press state
  const parentalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleParentalTouchStart = useCallback(() => {
    parentalTimerRef.current = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }, [router]);

  const handleParentalTouchEnd = useCallback(() => {
    if (parentalTimerRef.current) {
      clearTimeout(parentalTimerRef.current);
      parentalTimerRef.current = null;
    }
  }, []);

  const handleBuildingTap = useCallback((building: BuildingDef) => {
    if (!isUnlocked) return;
    setSelectedBuilding(building);
  }, []);

  const handleGameTap = useCallback(
    (gameId: string) => {
      setSelectedBuilding(null);
      router.push(`/play/${gameId}`);
    },
    [router],
  );

  const handleBatchPlay = useCallback(() => {
    if (!selectedBuilding) return;
    const firstGame = selectedBuilding.gameIds[0];
    setSelectedBuilding(null);
    router.push(`/play/${firstGame}`);
  }, [selectedBuilding, router]);

  const displayName = loading ? '...' : child?.displayName ?? '\u304A\u3068\u3082\u3060\u3061';

  return (
    <div
      className="relative min-h-dvh w-full"
      style={{
        backgroundImage: 'url(/assets/backgrounds/bg-home.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-deep-space/30" />

      {/* Smartphone container */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[430px] flex-col">
        {/* ---- Top Bar ---- */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between px-5">
          {/* Left: mascot + child name → ダッシュボードへ */}
          <button
            type="button"
            aria-label="保護者ダッシュボードをひらく"
            className="flex items-center gap-2 tap-interactive"
            onClick={() => router.push('/dashboard')}
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-cosmic/40 bg-galaxy/60">
              <Mogura expression="happy" size={36} className="object-cover" />
            </div>
            <span className="text-base font-bold text-stardust">{displayName}</span>
          </button>

          {/* Right: settings → /settings */}
          <Link href="/settings" aria-label="設定" className="tap-interactive p-1">
            <GearIcon size={24} className="text-moon" />
          </Link>
        </header>

        {/* ---- Main Area: Building Map (horizontal scroll) ---- */}
        <main
          className="flex flex-1 items-center gap-10 overflow-x-auto overflow-y-hidden px-5 py-8"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {BUILDINGS.map((building, index) => {
            const unlocked = building.id === 'hikari' || isUnlocked;

            return (
              <motion.button
                key={building.id}
                type="button"
                className="flex flex-shrink-0 flex-col items-center"
                style={{
                  scrollSnapAlign: 'center',
                  width: 200,
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                onClick={() => handleBuildingTap(building)}
                disabled={!unlocked}
              >
                {/* Building image wrapper */}
                <div className="relative">
                  <Image
                    src={building.image}
                    alt={building.name}
                    width={200}
                    height={200}
                    className="object-contain"
                    style={{
                      filter: unlocked ? 'none' : 'grayscale(1)',
                      opacity: unlocked ? 1 : 0.5,
                    }}
                    priority={index < 3}
                  />

                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LockIcon size={32} />
                    </div>
                  )}
                </div>

                {/* Building name */}
                <span className="mt-2 text-center text-sm font-bold text-stardust">
                  {building.name}
                </span>
              </motion.button>
            );
          })}
        </main>
      </div>

      {/* ---- Bottom Sheet (building detail) ---- */}
      <BottomSheet
        isOpen={selectedBuilding !== null}
        onClose={() => setSelectedBuilding(null)}
      >
        {selectedBuilding && (
          <div className="px-5 py-6">
            {/* Building header */}
            <div className="flex items-center gap-4">
              <Image
                src={selectedBuilding.image}
                alt={selectedBuilding.name}
                width={80}
                height={80}
                className="object-contain"
              />
              <h2 className="text-xl font-bold text-stardust">{selectedBuilding.name}</h2>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-galaxy-light" />

            {/* Game list */}
            <ul>
              {selectedBuilding.gameIds.map((gameId) => (
                <li key={gameId}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 tap-interactive"
                    onClick={() => handleGameTap(gameId)}
                  >
                    <span className="text-base text-stardust">
                      {GAME_DISPLAY_NAMES[gameId] ?? gameId}
                    </span>
                    <StarRating count={3} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Batch play button */}
            <button
              type="button"
              className="mt-4 h-12 w-full rounded-2xl bg-cosmic font-bold text-white active:scale-95 transition-transform"
              onClick={handleBatchPlay}
            >
              {'\u307E\u3068\u3081\u3066\u3042\u305D\u3076'}
            </button>
          </div>
        )}
      </BottomSheet>

      {/* ---- Parental Access (fixed bottom-right, long press) ---- */}
      <button
        type="button"
        aria-label="Parental access"
        className="fixed z-50 select-none"
        style={{
          bottom: 'calc(16px + env(safe-area-inset-bottom))',
          right: 16,
        }}
        onTouchStart={handleParentalTouchStart}
        onTouchEnd={handleParentalTouchEnd}
        onTouchCancel={handleParentalTouchEnd}
        onMouseDown={handleParentalTouchStart}
        onMouseUp={handleParentalTouchEnd}
        onMouseLeave={handleParentalTouchEnd}
      >
        <GearIcon size={24} className="text-moon opacity-50" />
      </button>
    </div>
  );
}
