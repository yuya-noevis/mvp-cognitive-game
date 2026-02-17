import Link from 'next/link';
import { PlayIcon, SettingsIcon } from '@/components/icons';
import Luna from '@/components/mascot/Luna';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden bg-space">

      {/* Star background (static for SSR) */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={i % 4 === 0 ? 'animate-twinkle' : ''}
          style={{
            position: 'absolute',
            left: `${(i * 41) % 100}%`,
            top: `${(i * 59) % 100}%`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            borderRadius: '50%',
            background: i % 5 === 0 ? '#FFD43B' : '#F0F0FF',
            opacity: 0.2 + (i % 4) * 0.15,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Nebula decorations */}
      <div className="absolute top-[-60px] right-[-40px] w-48 h-48 rounded-full opacity-[0.08] animate-breathe"
           style={{ background: 'radial-gradient(circle, #6C3CE1, transparent)' }} />
      <div className="absolute bottom-[-30px] left-[-20px] w-36 h-36 rounded-full opacity-[0.06] animate-breathe"
           style={{ background: 'radial-gradient(circle, #FF6B9D, transparent)', animationDelay: '1s' }} />

      {/* Luna with speech bubble */}
      <div className="animate-fade-in-up mb-2 relative z-10">
        <Luna
          expression="excited"
          pose="waving"
          size={160}
          speechBubble="いっしょに あそぼう！"
        />
      </div>

      {/* Title */}
      <div className="animate-fade-in-up text-center relative z-10" style={{ animationDelay: '100ms' }}>
        <h1 className="text-4xl font-bold" style={{ color: '#8B5CF6' }}>Manas</h1>
        <p className="mt-1 text-base" style={{ color: '#B8B8D0' }}>
          うちゅう にんち トレーニング
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex flex-col gap-4 w-full max-w-xs animate-fade-in-up relative z-10" style={{ animationDelay: '200ms' }}>
        <Link
          href="/select"
          className="btn-cosmic tap-target-large flex items-center justify-center gap-3 px-8 py-5 text-xl font-bold rounded-2xl tap-interactive active:scale-95 relative overflow-hidden"
        >
          <PlayIcon size={28} />
          ぼうけんへ
          {/* Shimmer effect */}
          <span className="absolute inset-0 opacity-10"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s infinite',
                }} />
        </Link>
      </div>

      {/* Sub links */}
      <div className="mt-6 flex gap-6 animate-fade-in-up relative z-10" style={{ animationDelay: '350ms' }}>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium tap-interactive"
              style={{ color: '#8888AA' }}>
          ほごしゃ
        </Link>
        <Link href="/settings" className="flex items-center gap-1.5 text-sm font-medium tap-interactive"
              style={{ color: '#8888AA' }}>
          <SettingsIcon size={16} />
          せってい
        </Link>
      </div>
    </main>
  );
}
