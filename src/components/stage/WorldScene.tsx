'use client';

import React from 'react';
import { LunaFaceOnly } from '@/components/mascot/Luna';

interface WorldSceneProps {
  level: number;
  children?: React.ReactNode;
}

/** Nebula color palettes per level range */
function getSpaceColors(level: number): { top: string; mid: string; accent: string } {
  if (level <= 2) return { top: '#0D0D2B', mid: '#1A1A40', accent: '#6C3CE1' };
  if (level <= 4) return { top: '#0D0D2B', mid: '#2A1A3A', accent: '#FF6B9D' };
  if (level <= 6) return { top: '#0D0D2B', mid: '#1A2A3A', accent: '#4ECDC4' };
  if (level <= 8) return { top: '#0D0D2B', mid: '#2A2A1A', accent: '#FFD43B' };
  return { top: '#0D0D2B', mid: '#1A1A40', accent: '#2ED573' };
}

/**
 * WorldScene - 宇宙テーマのワールドビュー
 *
 * 深宇宙背景 + 星 + 星雲 + 宇宙ステーション
 */
export function WorldScene({ level, children }: WorldSceneProps) {
  const colors = getSpaceColors(level);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Space gradient */}
      <div className="absolute inset-0"
           style={{ background: `linear-gradient(180deg, ${colors.top} 0%, ${colors.mid} 60%, #2A2A5A 100%)` }} />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={i % 4 === 0 ? 'animate-twinkle' : ''}
            style={{
              position: 'absolute',
              left: `${(i * 43) % 100}%`,
              top: `${(i * 59) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              borderRadius: '50%',
              background: i % 6 === 0 ? '#FFD43B' : '#F0F0FF',
              opacity: 0.2 + (i % 4) * 0.12,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula accents */}
      <div className="absolute top-[15%] left-[-10%] w-48 h-48 rounded-full animate-nebula-drift"
           style={{ background: `radial-gradient(circle, ${colors.accent}15, transparent)` }} />
      <div className="absolute top-[50%] right-[-5%] w-64 h-64 rounded-full animate-nebula-drift"
           style={{ background: `radial-gradient(circle, ${colors.accent}10, transparent)`, animationDelay: '4s' }} />

      {/* Top bar: Avatar + Action buttons */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-12 pb-2">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
             style={{
               background: 'rgba(42, 42, 90, 0.8)',
               border: '3px solid rgba(108, 60, 225, 0.4)',
               boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
             }}>
          <LunaFaceOnly expression="happy" size={44} />
        </div>

        <div className="flex items-center gap-3">
          <CircleButton>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="#FFD43B" />
            </svg>
          </CircleButton>
          <CircleButton>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" fill="#8B5CF6" />
              <rect x="6" y="5" width="12" height="3" rx="1" fill="white" opacity="0.3" />
            </svg>
          </CircleButton>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1">
        {children}
      </div>

      {/* Space station illustration at bottom */}
      <div className="relative z-10">
        <SpaceStationScene />
      </div>

      {/* Ground bar: level */}
      <div className="relative z-20 text-center py-3"
           style={{ background: 'rgba(26, 26, 64, 0.9)', borderTop: '1px solid rgba(108, 60, 225, 0.2)' }}>
        <span className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: 'rgba(139, 92, 246, 0.6)', letterSpacing: '0.2em' }}>
          LEVEL {level}
        </span>
      </div>
    </div>
  );
}

function CircleButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-full flex items-center justify-center tap-interactive"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(42, 42, 90, 0.8)',
              border: '2px solid rgba(108, 60, 225, 0.3)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
            }}>
      {children}
    </button>
  );
}

/** Space station scene at bottom */
function SpaceStationScene() {
  return (
    <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet" className="block">
      {/* Planet surface hint */}
      <ellipse cx="200" cy="200" rx="300" ry="80" fill="#2A2A5A" opacity={0.6} />
      <ellipse cx="200" cy="200" rx="280" ry="70" fill="#1A1A40" opacity={0.4} />

      {/* Central dome */}
      <g transform="translate(150, 40)">
        <ellipse cx="50" cy="80" rx="45" ry="35" fill="#3A3A6A" />
        <ellipse cx="50" cy="80" rx="40" ry="30" fill="#4A4A7A" />
        {/* Dome top */}
        <path d="M15 80 Q50 30, 85 80" fill="#6C3CE1" opacity={0.3} />
        {/* Windows */}
        <circle cx="35" cy="70" r="8" fill="#8B5CF6" opacity={0.4} />
        <circle cx="65" cy="70" r="8" fill="#8B5CF6" opacity={0.4} />
        <circle cx="50" cy="55" r="6" fill="#FFD43B" opacity={0.5} />
        {/* Antenna */}
        <line x1="50" y1="35" x2="50" y2="15" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx="50" cy="13" r="3" fill="#FFD43B" opacity={0.8} />
      </g>

      {/* Left module */}
      <g transform="translate(40, 60)">
        <rect x="0" y="30" width="60" height="40" rx="10" fill="#3A3A6A" />
        <rect x="5" y="35" width="50" height="30" rx="8" fill="#4A4A7A" />
        <circle cx="20" cy="50" r="6" fill="#4ECDC4" opacity={0.3} />
        <circle cx="40" cy="50" r="6" fill="#4ECDC4" opacity={0.3} />
        {/* Connector */}
        <rect x="60" y="45" width="50" height="8" rx="4" fill="#3A3A6A" />
      </g>

      {/* Right module */}
      <g transform="translate(300, 55)">
        <rect x="0" y="30" width="55" height="45" rx="10" fill="#3A3A6A" />
        <rect x="5" y="35" width="45" height="35" rx="8" fill="#4A4A7A" />
        <circle cx="27" cy="52" r="8" fill="#FF6B9D" opacity={0.3} />
        {/* Connector */}
        <rect x="-50" y="48" width="50" height="8" rx="4" fill="#3A3A6A" />
      </g>

      {/* Small satellite */}
      <g transform="translate(330, 20)">
        <rect x="0" y="0" width="20" height="10" rx="3" fill="#FFD43B" opacity={0.6} />
        <rect x="-10" y="3" width="10" height="4" rx="2" fill="#4ECDC4" opacity={0.4} />
        <rect x="20" y="3" width="10" height="4" rx="2" fill="#4ECDC4" opacity={0.4} />
      </g>
    </svg>
  );
}
