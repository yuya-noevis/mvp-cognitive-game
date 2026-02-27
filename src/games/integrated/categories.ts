import type { CognitiveCategory, IntegratedGameId } from './types';

export interface CategoryDef {
  id: CognitiveCategory;
  name: string;
  buildingImage: string;
  buildingId: string;
  gameIds: IntegratedGameId[];
}

/**
 * 5カテゴリ定義 (game-design-v2.md Section 1)
 * 各カテゴリに既存ビルディング画像を対応付け
 */
export const CATEGORIES: CategoryDef[] = [
  {
    id: 'attention-inhibition',
    name: 'ひかりラボ',
    buildingImage: '/assets/buildings/building-hikari.png',
    buildingId: 'hikari',
    gameIds: ['hikari-rescue'],
  },
  {
    id: 'memory-learning',
    name: 'ことばライブラリ',
    buildingImage: '/assets/buildings/building-kotoba.png',
    buildingId: 'kotoba',
    gameIds: ['oboete-susumu'],
  },
  {
    id: 'flexibility-control',
    name: 'ひらめきタワー',
    buildingImage: '/assets/buildings/building-hirameki.png',
    buildingId: 'hirameki',
    gameIds: ['rule-change', 'tanken-meiro'],
  },
  {
    id: 'perception-spatial',
    name: 'かんかくドーム',
    buildingImage: '/assets/buildings/building-kankaku.png',
    buildingId: 'kankaku',
    gameIds: ['kurukuru-puzzle', 'touch-adventure'],
  },
  {
    id: 'social-language',
    name: 'こころハウス',
    buildingImage: '/assets/buildings/building-kokoro.png',
    buildingId: 'kokoro',
    gameIds: ['kimochi-friends', 'kotoba-ehon'],
  },
];
