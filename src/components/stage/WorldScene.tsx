'use client';

import React from 'react';
import { ManasFace } from '@/components/mascot/ManasCharacter';

interface WorldSceneProps {
  level: number;
  children?: React.ReactNode;
}

/** Sky color palettes per level range */
function getSkyColors(level: number): { top: string; bottom: string; cloud: string } {
  if (level <= 2) return { top: '#4EC5F1', bottom: '#7DD6F5', cloud: 'rgba(255,255,255,0.45)' };
  if (level <= 4) return { top: '#FF8EC8', bottom: '#FFBCDD', cloud: 'rgba(255,230,240,0.5)' };
  if (level <= 6) return { top: '#C882E8', bottom: '#DEAAF0', cloud: 'rgba(240,220,250,0.5)' };
  if (level <= 8) return { top: '#FFB347', bottom: '#FFD699', cloud: 'rgba(255,240,220,0.5)' };
  return { top: '#4EC5F1', bottom: '#7DD6F5', cloud: 'rgba(255,255,255,0.45)' };
}

/**
 * WorldScene - Duolingo ABC風のワールドビュー
 *
 * カラフルな空 + 浮かぶ雲 + イラスト風建物 + グレーの地面 + レベル表示
 * スクリーンショットの世界観を再現
 */
export function WorldScene({ level, children }: WorldSceneProps) {
  const sky = getSkyColors(level);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden" data-theme="duo">
      {/* Sky gradient */}
      <div className="absolute inset-0"
           style={{ background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 65%, var(--duo-ground, #808080) 100%)` }} />

      {/* Clouds */}
      <Cloud x="5%" y="18%" size={130} opacity={0.7} color={sky.cloud} className="animate-cloud-drift" />
      <Cloud x="55%" y="12%" size={100} opacity={0.5} color={sky.cloud} className="animate-cloud-drift-slow" />
      <Cloud x="25%" y="35%" size={110} opacity={0.6} color={sky.cloud} className="animate-cloud-drift" style={{ animationDelay: '3s' }} />
      <Cloud x="70%" y="28%" size={85} opacity={0.4} color={sky.cloud} className="animate-cloud-drift-slow" style={{ animationDelay: '5s' }} />

      {/* Top bar: Avatar + Action buttons */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-12 pb-2">
        {/* Avatar circle with outer grey ring */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
             style={{
               background: 'white',
               border: '3px solid rgba(200,200,200,0.5)',
               boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
             }}>
          <ManasFace expression="happy" size={44} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <CircleButton>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="5" fill="#FFC800" />
              <path d="M12 3l1.5 3 3.5.5-2.5 2.5.5 3.5L12 11l-3 1.5.5-3.5L7 6.5l3.5-.5L12 3z" fill="#FFE066" />
            </svg>
          </CircleButton>
          <CircleButton>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" fill="#1CB0F6" />
              <rect x="6" y="5" width="12" height="3" rx="1" fill="white" opacity="0.3" />
              <path d="M14 2v4" stroke="#FF4B4B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </CircleButton>
        </div>
      </div>

      {/* Main content area (scrollable) */}
      <div className="relative z-10 flex-1">
        {children}
      </div>

      {/* Buildings illustration at bottom */}
      <div className="relative z-10">
        <TownScene />
      </div>

      {/* Ground + Level bar */}
      <div className="relative z-20 text-center py-3"
           style={{ background: 'var(--duo-ground, #808080)' }}>
        <span className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em' }}>
          LEVEL {level}
        </span>
      </div>
    </div>
  );
}

/** White circle button (for top-right actions) */
function CircleButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-13 h-13 rounded-full flex items-center justify-center tap-interactive"
            style={{
              width: 48,
              height: 48,
              background: 'white',
              boxShadow: '0 3px 0 rgba(0,0,0,0.08), 0 3px 10px rgba(0,0,0,0.12)',
            }}>
      {children}
    </button>
  );
}

/** SVG cloud shape */
function Cloud({ x, y, size, opacity, color, className = '', style = {} }: {
  x: string; y: string; size: number; opacity: number; color: string; className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`absolute ${className}`}
         style={{ left: x, top: y, opacity, ...style }}>
      <svg width={size} height={size * 0.5} viewBox="0 0 120 60">
        <ellipse cx="60" cy="38" rx="50" ry="20" fill={color} />
        <ellipse cx="40" cy="30" rx="30" ry="22" fill={color} />
        <ellipse cx="80" cy="32" rx="28" ry="18" fill={color} />
        <ellipse cx="55" cy="24" rx="25" ry="20" fill={color} />
      </svg>
    </div>
  );
}

/** Simplified Duolingo ABC-style town illustration */
function TownScene() {
  return (
    <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="xMidYMax meet" className="block">
      {/* Ground/sidewalk */}
      <rect x="0" y="150" width="400" height="30" fill="#808080" />
      <rect x="0" y="148" width="400" height="4" fill="#707070" />

      {/* School building (left) */}
      <g transform="translate(30, 0)">
        {/* Main body */}
        <rect x="0" y="60" width="80" height="90" rx="3" fill="#E74C3C" />
        <rect x="5" y="65" width="70" height="80" fill="#C0392B" opacity="0.3" />
        {/* Roof */}
        <polygon points="40,20 -5,60 85,60" fill="#7F8C8D" />
        <polygon points="40,25 0,58 80,58" fill="#95A5A6" />
        {/* Bell tower */}
        <rect x="30" y="30" width="20" height="30" rx="2" fill="#3498DB" />
        <circle cx="40" cy="42" r="6" fill="#F1C40F" />
        {/* Door */}
        <rect x="28" y="115" width="24" height="35" rx="12" fill="#F39C12" />
        <circle cx="46" cy="135" r="2" fill="#D68910" />
        {/* Windows */}
        <rect x="10" y="80" width="16" height="16" rx="2" fill="#AED6F1" />
        <rect x="54" y="80" width="16" height="16" rx="2" fill="#AED6F1" />
        {/* Manas banner */}
        <rect x="25" y="45" width="30" height="10" rx="2" fill="#58CC02" />
      </g>

      {/* Tall pencil building (center) */}
      <g transform="translate(140, 0)">
        {/* Main body */}
        <rect x="0" y="30" width="60" height="120" rx="3" fill="#F1C40F" />
        <rect x="5" y="35" width="50" height="110" fill="#F39C12" opacity="0.2" />
        {/* Pencil tip top */}
        <polygon points="30,5 0,30 60,30" fill="#4A4A4A" />
        <polygon points="30,10 5,28 55,28" fill="#F1C40F" />
        {/* Windows */}
        <rect x="8" y="45" width="18" height="14" rx="2" fill="#FDEBD0" />
        <rect x="34" y="45" width="18" height="14" rx="2" fill="#FDEBD0" />
        <rect x="8" y="70" width="18" height="14" rx="2" fill="#FDEBD0" />
        <rect x="34" y="70" width="18" height="14" rx="2" fill="#FDEBD0" />
        <rect x="8" y="95" width="18" height="14" rx="2" fill="#FDEBD0" />
        <rect x="34" y="95" width="18" height="14" rx="2" fill="#FDEBD0" />
        {/* Door */}
        <rect x="18" y="120" width="24" height="30" rx="3" fill="#3498DB" />
      </g>

      {/* Colorful apartment (right) */}
      <g transform="translate(230, 0)">
        {/* Main body */}
        <rect x="0" y="20" width="70" height="130" rx="3" fill="#E74C3C" />
        {/* Floor colors */}
        <rect x="0" y="20" width="70" height="28" rx="3" fill="#F1C40F" />
        <rect x="0" y="48" width="70" height="28" fill="#3498DB" />
        <rect x="0" y="76" width="70" height="28" fill="#2ECC71" />
        <rect x="0" y="104" width="70" height="28" fill="#9B59B6" />
        <rect x="0" y="132" width="70" height="18" rx="0" fill="#1ABC9C" />
        {/* Windows */}
        <rect x="8" y="28" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="28" y="28" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="50" y="28" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="8" y="56" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="28" y="56" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="50" y="56" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="8" y="84" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="28" y="84" width="12" height="14" rx="2" fill="#FDEBD0" />
        <rect x="50" y="84" width="12" height="14" rx="2" fill="#FDEBD0" />
        {/* Fire escape */}
        <line x1="72" y1="20" x2="72" y2="150" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="72" y1="48" x2="85" y2="48" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="85" y1="48" x2="85" y2="76" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="72" y1="76" x2="85" y2="76" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="72" y1="104" x2="85" y2="104" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="85" y1="104" x2="85" y2="132" stroke="#4A4A4A" strokeWidth="2" />
        {/* Door */}
        <rect x="25" y="135" width="20" height="15" rx="2" fill="#2C3E50" />
        {/* Awning */}
        <rect x="-5" y="130" width="80" height="6" rx="2" fill="#1ABC9C" />
        {/* Flower pots */}
        <circle cx="8" y="130" r="4" fill="#E74C3C" />
        <circle cx="62" y="130" r="4" fill="#F1C40F" />
      </g>

      {/* Small bush */}
      <ellipse cx="125" cy="148" rx="12" ry="8" fill="#27AE60" />
      <ellipse cx="128" cy="145" rx="8" ry="7" fill="#2ECC71" />

      {/* Street lamp */}
      <rect x="320" y="100" width="3" height="50" fill="#4A4A4A" />
      <circle cx="321" cy="98" r="6" fill="#F1C40F" opacity="0.8" />
      <rect x="315" y="92" width="12" height="3" rx="1" fill="#4A4A4A" />
    </svg>
  );
}
