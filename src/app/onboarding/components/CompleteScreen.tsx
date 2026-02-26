'use client';

import Mogura from '@/components/mascot/Mogura';

export function CompleteScreen({
  childName,
  error,
  saving,
  onFinish,
}: {
  childName: string;
  error: string;
  saving: boolean;
  onFinish: () => void;
}) {
  const displayName = childName || 'おともだち';

  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-12">
      <Mogura expression="excited" size={160} />

      <h2 className="text-2xl font-bold text-stardust">準備ができました！</h2>
      <p className="text-base text-moon">
        {displayName}さんに合わせたトレーニングを始めましょう
      </p>

      {error && <p className="w-full text-sm text-supernova text-center">{error}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={onFinish}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '保存中...' : 'はじめる'}
      </button>
    </div>
  );
}
