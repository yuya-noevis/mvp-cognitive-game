'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GameId } from '@/types';
import { findIntegratedGameForSource } from '@/games/integrated';

/**
 * レガシー /play/[gameId] ルート → /game/[integratedId] へリダイレクト
 *
 * ソースゲームIDから統合ゲームIDを逆引きし、新ルートへ転送する。
 * kakurenbo-katachi（アーカイブ済み）はホームにリダイレクト。
 */
export default function LegacyPlayRedirect() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  useEffect(() => {
    const integratedId = findIntegratedGameForSource(gameId as GameId);
    if (integratedId) {
      router.replace(`/game/${integratedId}`);
    } else {
      // Unknown or archived game → home
      router.replace('/');
    }
  }, [gameId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space">
      <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
    </div>
  );
}
