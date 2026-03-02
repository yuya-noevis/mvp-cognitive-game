import type { IntegratedGameId } from '@/games/integrated/types';
import type { Tier } from '@/features/gating';
import { getAccessibleGames } from '@/features/gating';
import { CATEGORIES } from '@/games/integrated/categories';

interface GameSelectionInput {
  tier: Tier;
  gameCount: number;
  recentGameIds?: IntegratedGameId[];
  cognitiveProfile?: Record<string, number>;
}

export function selectGamesForSession(input: GameSelectionInput): IntegratedGameId[] {
  const { accessible } = getAccessibleGames(input.tier);

  // 1. 直近でプレイしていないゲームを優先
  let candidates = accessible.filter(id => !input.recentGameIds?.includes(id));
  if (candidates.length < input.gameCount) {
    candidates = accessible;
  }

  // 2. 異なるカテゴリから選択（同一カテゴリ連続を避ける）
  const selected: IntegratedGameId[] = [];
  const usedCategories: string[] = [];

  for (const candidate of shuffleArray(candidates)) {
    if (selected.length >= input.gameCount) break;

    const category = getCategoryForGame(candidate);
    if (!usedCategories.includes(category) || selected.length >= accessible.length / 2) {
      selected.push(candidate);
      usedCategories.push(category);
    }
  }

  // 足りない場合は残りから埋める
  while (selected.length < input.gameCount && selected.length < accessible.length) {
    const remaining = accessible.filter(id => !selected.includes(id));
    if (remaining.length === 0) break;
    selected.push(remaining[0]);
  }

  return selected;
}

function getCategoryForGame(gameId: IntegratedGameId): string {
  for (const cat of CATEGORIES) {
    if (cat.gameIds.includes(gameId)) return cat.id;
  }
  return 'unknown';
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- 直近プレイ履歴の保存 (Step 8-8) ---

const RECENT_GAMES_KEY = 'manas-recent-session-games';

export function saveRecentGames(gameIds: IntegratedGameId[]): void {
  try {
    const stored: IntegratedGameId[][] = JSON.parse(
      localStorage.getItem(RECENT_GAMES_KEY) || '[]',
    );
    stored.unshift(gameIds);
    if (stored.length > 3) stored.pop();
    localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
}

export function getRecentGames(): IntegratedGameId[] {
  try {
    const stored: IntegratedGameId[][] = JSON.parse(
      localStorage.getItem(RECENT_GAMES_KEY) || '[]',
    );
    return stored.flat();
  } catch {
    return [];
  }
}
