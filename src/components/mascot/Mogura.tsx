'use client';
import Image from 'next/image';

export type Expression = 'happy' | 'excited' | 'encouraging' | 'surprised' | 'sleepy' | 'clapping' | 'pointing' | 'waving';

interface MoguraProps {
  expression?: Expression;
  size?: number;
  className?: string;
}

export default function Mogura({ expression = 'happy', size = 120, className = '' }: MoguraProps) {
  return (
    <Image
      src={`/assets/characters/mogura-${expression}.png`}
      alt="Mogu"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
