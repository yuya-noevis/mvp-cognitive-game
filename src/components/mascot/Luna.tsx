'use client';

/**
 * Luna — Mogura へのエイリアス（後方互換維持）
 * speechBubble が渡された場合は MoguraSpeech を使用
 */
import Mogura from './Mogura';
import { MoguraSpeech } from './MoguraSpeech';
import type { Expression } from './Mogura';

export type LunaExpression = Expression;
export type LunaPose = 'standing' | 'waving' | 'jumping' | 'sitting';

interface LunaProps {
  expression?: LunaExpression;
  pose?: LunaPose;
  size?: number;
  className?: string;
  animate?: boolean;
  speechBubble?: string;
  onDismissSpeech?: () => void;
}

export default function Luna({
  expression = 'happy',
  size = 120,
  className = '',
  speechBubble,
  onDismissSpeech,
}: LunaProps) {
  if (speechBubble) {
    return (
      <MoguraSpeech
        expression={expression}
        size={size}
        message={speechBubble}
        onDismiss={onDismissSpeech}
        className={className}
      />
    );
  }
  return <Mogura expression={expression} size={size} className={className} />;
}

export function LunaFaceOnly({
  expression = 'happy',
  size = 40,
  className = '',
}: {
  expression?: LunaExpression;
  size?: number;
  className?: string;
}) {
  return <Mogura expression={expression} size={size} className={className} />;
}
