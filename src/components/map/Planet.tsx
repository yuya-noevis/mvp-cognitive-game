'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PlanetProps {
  name: string;
  color: string;
  size?: number;
  locked?: boolean;
  completed?: boolean;
  isCurrent?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Planet — 個別の惑星コンポーネント
 *
 * 自転・浮遊アニメーション
 * ロック/アンロック状態表示
 */
export function Planet({
  name,
  color,
  size = 80,
  locked = false,
  completed = false,
  isCurrent = false,
  icon,
  onClick,
  className = '',
}: PlanetProps) {
  return (
    <motion.button
      onClick={locked ? undefined : onClick}
      className={`relative flex flex-col items-center gap-1 ${className}`}
      whileTap={locked ? undefined : { scale: 0.9 }}
      animate={isCurrent ? { y: [0, -6, 0] } : undefined}
      transition={isCurrent ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : undefined}
      style={{ cursor: locked ? 'default' : 'pointer' }}
    >
      {/* Planet body */}
      <div
        className="rounded-full flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          background: locked
            ? 'linear-gradient(135deg, #3A3A6A 0%, #2A2A5A 100%)'
            : `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: locked
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : `0 4px 16px ${color}44, inset -${size/8}px -${size/8}px ${size/4}px rgba(0,0,0,0.15)`,
          border: isCurrent ? `3px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Surface details */}
        {!locked && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: size * 0.3,
                height: size * 0.2,
                top: '25%',
                left: '20%',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: size * 0.15,
                height: size * 0.12,
                bottom: '30%',
                right: '25%',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
              }}
            />
          </>
        )}

        {/* Icon or lock */}
        {locked ? (
          <svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="#8888AA">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z"/>
          </svg>
        ) : icon ? (
          <div style={{ fontSize: size * 0.35 }}>{icon}</div>
        ) : null}

        {/* Completed checkmark */}
        {completed && !locked && (
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#2ED573', boxShadow: '0 2px 6px rgba(46, 213, 115, 0.4)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        )}

        {/* Current indicator glow */}
        {isCurrent && (
          <div
            className="absolute inset-0 rounded-full animate-cosmic-glow"
            style={{
              boxShadow: `0 0 20px ${color}66`,
            }}
          />
        )}
      </div>

      {/* Planet name */}
      <span
        className="text-xs font-bold text-center max-w-[80px] leading-tight"
        style={{
          color: locked ? '#8888AA' : '#F0F0FF',
        }}
      >
        {name}
      </span>
    </motion.button>
  );
}
