'use client';

import React from 'react';
import { motion } from 'framer-motion';

type CosmicButtonVariant = 'primary' | 'secondary' | 'ghost' | 'star';
type CosmicButtonSize = 'lg' | 'md' | 'sm';

interface CosmicButtonProps {
  children: React.ReactNode;
  variant?: CosmicButtonVariant;
  size?: CosmicButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}

const VARIANT_STYLES: Record<CosmicButtonVariant, { bg: string; shadow: string; text: string }> = {
  primary: {
    bg: 'linear-gradient(135deg, #6C3CE1 0%, #8B5CF6 100%)',
    shadow: '0 4px 0 #5B2CC9, 0 6px 12px rgba(108, 60, 225, 0.3)',
    text: '#FFFFFF',
  },
  secondary: {
    bg: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
    shadow: '0 4px 0 #3ABBB3, 0 6px 12px rgba(78, 205, 196, 0.3)',
    text: '#FFFFFF',
  },
  ghost: {
    bg: 'rgba(108, 60, 225, 0.12)',
    shadow: '0 2px 8px rgba(0,0,0,0.1)',
    text: '#8B5CF6',
  },
  star: {
    bg: 'linear-gradient(135deg, #FFD43B 0%, #FFE066 100%)',
    shadow: '0 4px 0 #E6BE35, 0 6px 12px rgba(255, 212, 59, 0.3)',
    text: '#1A1A40',
  },
};

const SIZE_CLASSES: Record<CosmicButtonSize, string> = {
  lg: 'h-14 px-8 text-lg',
  md: 'h-12 px-6 text-base',
  sm: 'h-10 px-4 text-sm',
};

export function CosmicButton({
  children,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}: CosmicButtonProps) {
  const style = VARIANT_STYLES[variant];

  if (disabled) {
    return (
      <button
        type={type}
        disabled
        className={`inline-flex items-center justify-center gap-2 font-bold rounded-2xl ${SIZE_CLASSES[size]} ${className}`}
        style={{
          background: '#B8B8D0',
          color: '#8888AA',
          boxShadow: '0 2px 0 #9999B0',
          pointerEvents: 'none',
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.93, y: 3 }}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-2xl tap-target ${SIZE_CLASSES[size]} ${className}`}
      style={{
        background: style.bg,
        color: style.text,
        boxShadow: style.shadow,
      }}
    >
      {children}
    </motion.button>
  );
}
