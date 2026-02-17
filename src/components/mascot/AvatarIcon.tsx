'use client';

import React from 'react';
import type { AvatarData } from './avatars';

interface AvatarIconProps {
  avatar: AvatarData;
  size?: number;
  selected?: boolean;
  className?: string;
}

/**
 * AvatarIcon — 丸いフレーム内のアバター表示
 *
 * 宇宙×動物テーマ。2〜2.5頭身の動物アイコン。
 */
export function AvatarIcon({ avatar, size = 60, selected = false, className = '' }: AvatarIconProps) {
  const animalPath = getAnimalPath(avatar.animal);

  return (
    <div
      className={`relative rounded-full flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${avatar.color}33 0%, ${avatar.color}66 100%)`,
        border: selected ? `3px solid ${avatar.color}` : '3px solid rgba(255,255,255,0.1)',
        boxShadow: selected ? `0 0 16px ${avatar.color}44` : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 40 40"
        fill="none"
      >
        {/* Simple animal silhouette */}
        <circle cx="20" cy="18" r="12" fill={avatar.color} opacity={0.9} />
        <circle cx="20" cy="24" r="9" fill={avatar.color} opacity={0.7} />
        {animalPath}
        {/* Eyes */}
        <circle cx="16" cy="16" r="2" fill="white" />
        <circle cx="24" cy="16" r="2" fill="white" />
        <circle cx="16" cy="16" r="1.2" fill="#2D1810" />
        <circle cx="24" cy="16" r="1.2" fill="#2D1810" />
        {/* Blush */}
        <circle cx="13" cy="20" r="2" fill="#FF6B9D" opacity={0.2} />
        <circle cx="27" cy="20" r="2" fill="#FF6B9D" opacity={0.2} />
      </svg>

      {/* Star badge if selected */}
      {selected && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: '#FFD43B' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A40">
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
        </div>
      )}
    </div>
  );
}

function getAnimalPath(animal: string): React.ReactNode {
  switch (animal) {
    case 'ねこ':
      return (
        <>
          <polygon points="10,10 14,3 18,10" fill="currentColor" opacity={0.8} />
          <polygon points="22,10 26,3 30,10" fill="currentColor" opacity={0.8} />
        </>
      );
    case 'うさぎ':
      return (
        <>
          <ellipse cx="15" cy="5" rx="3" ry="8" fill="currentColor" opacity={0.8} />
          <ellipse cx="25" cy="5" rx="3" ry="8" fill="currentColor" opacity={0.8} />
        </>
      );
    case 'いぬ':
      return (
        <>
          <ellipse cx="11" cy="8" rx="5" ry="7" fill="currentColor" opacity={0.7} transform="rotate(-15, 11, 8)" />
          <ellipse cx="29" cy="8" rx="5" ry="7" fill="currentColor" opacity={0.7} transform="rotate(15, 29, 8)" />
        </>
      );
    case 'くま':
      return (
        <>
          <circle cx="10" cy="8" r="5" fill="currentColor" opacity={0.8} />
          <circle cx="30" cy="8" r="5" fill="currentColor" opacity={0.8} />
        </>
      );
    default:
      return (
        <>
          <circle cx="12" cy="8" r="4" fill="currentColor" opacity={0.7} />
          <circle cx="28" cy="8" r="4" fill="currentColor" opacity={0.7} />
        </>
      );
  }
}
