import Link from 'next/link';
import { PlayIcon, SettingsIcon } from '@/components/icons';
import { ManasCharacter } from '@/components/mascot/ManasCharacter';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #F7F7F7 0%, #FFFFFF 100%)' }}>

      {/* Decorative background circles */}
      <div className="absolute top-[-60px] right-[-40px] w-40 h-40 rounded-full opacity-[0.08] animate-breathe"
           style={{ background: '#58CC02' }} />
      <div className="absolute bottom-[-30px] left-[-20px] w-28 h-28 rounded-full opacity-[0.06] animate-breathe"
           style={{ background: '#1CB0F6', animationDelay: '1s' }} />

      {/* Mascot Character with speech bubble */}
      <div className="animate-fade-in-up mb-2">
        <ManasCharacter
          expression="excited"
          pose="waving"
          size={160}
          speechBubble="いっしょに あそぼう！"
        />
      </div>

      {/* Title */}
      <div className="animate-fade-in-up text-center" style={{ animationDelay: '100ms' }}>
        <h1 className="text-4xl font-bold" style={{ color: '#58CC02' }}>Manas</h1>
        <p className="mt-1 text-base" style={{ color: '#AFAFAF' }}>
          にんち トレーニング
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex flex-col gap-4 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Link
          href="/select"
          className="btn-duo-green tap-target-large flex items-center justify-center gap-3 px-8 py-5 text-xl font-bold rounded-2xl tap-interactive active:scale-95 relative overflow-hidden"
        >
          <PlayIcon size={28} />
          あそぶ
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
      <div className="mt-6 flex gap-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium tap-interactive"
              style={{ color: '#AFAFAF' }}>
          ほごしゃ
        </Link>
        <Link href="/settings" className="flex items-center gap-1.5 text-sm font-medium tap-interactive"
              style={{ color: '#AFAFAF' }}>
          <SettingsIcon size={16} />
          せってい
        </Link>
      </div>
    </main>
  );
}
