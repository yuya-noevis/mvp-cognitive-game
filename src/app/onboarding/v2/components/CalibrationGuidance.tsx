'use client';

import Mogura from '@/components/mascot/Mogura';
import { getChildName } from '@/features/onboarding-profile';
import type { Honorific } from '@/features/onboarding-profile';

interface CalibrationGuidanceProps {
  childName: string;
  honorific: Honorific | '';
  onStart: () => void;
  onSkip: () => void;
}

export function CalibrationGuidance({ childName, honorific, onStart, onSkip }: CalibrationGuidanceProps) {
  const displayName = getChildName(childName, honorific);

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <Mogura expression="encouraging" size={140} />

      <div className="text-center">
        <h2 className="text-xl font-bold text-stardust">
          ここからはお子さまと一緒に
        </h2>
      </div>

      <div
        className="w-full rounded-2xl px-5 py-5"
        style={{ background: 'rgba(108, 60, 225, 0.08)', border: '1px solid rgba(108, 60, 225, 0.15)' }}
      >
        <p className="text-sm text-moon leading-relaxed">
          次の画面から、お子さまと一緒にかんたんなゲームを体験します。
        </p>
        <p className="text-sm text-moon leading-relaxed mt-2">
          {displayName}のタブレット操作や理解度を自動で確認し、
          ぴったりの難しさでゲームを始められるようにします。
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity active:scale-[0.98]"
      >
        子どもと一緒に始める
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="text-sm text-moon/60 underline"
      >
        スキップして後で
      </button>
    </div>
  );
}
