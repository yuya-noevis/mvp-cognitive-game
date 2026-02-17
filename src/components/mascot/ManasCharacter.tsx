'use client';

/**
 * ManasCharacter — Luna へのエイリアス（後方互換維持）
 *
 * 既存コードでの ManasCharacter / ManasFace のインポートを維持するため、
 * Luna コンポーネントをそのまま再エクスポートする。
 */
import Luna, { LunaFaceOnly } from './Luna';
import type { LunaExpression, LunaPose } from './Luna';

// Type aliases for backward compatibility
export type MascotExpression = LunaExpression;
export type MascotPose = LunaPose;

// Re-export Luna as ManasCharacter
export function ManasCharacter(props: {
  expression?: MascotExpression;
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
  speechBubble?: string;
}) {
  return <Luna {...props} />;
}

// Re-export LunaFaceOnly as ManasFace
export function ManasFace(props: {
  expression?: MascotExpression;
  size?: number;
  className?: string;
}) {
  return <LunaFaceOnly {...props} />;
}

export default ManasCharacter;
