'use client';

export function StickyNextButton({
  label = 'つぎへ',
  disabled = false,
  saving = false,
  onClick,
}: {
  label?: string;
  disabled?: boolean;
  saving?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 w-full pt-4 pb-8 bg-gradient-to-t from-[#0D0D2B]/90 to-transparent">
      <button
        type="button"
        disabled={disabled || saving}
        onClick={onClick}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '処理中...' : label}
      </button>
    </div>
  );
}
