import type { CognitiveDomain, GameConfig, GameId } from '@/types';
import { hikariCatchConfig } from './hikari-catch/config';
import { matteStopConfig } from './matte-stop/config';
import { oboeteNarabeteConfig } from './oboete-narabete/config';
import { katachiSagashiConfig } from './katachi-sagashi/config';
import { irokaeSwitchConfig } from './irokae-switch/config';
import { hayawazaTouchConfig } from './hayawaza-touch/config';
import { oboeteMatchConfig } from './oboete-match/config';
import { tsumitageTowerConfig } from './tsumitage-tower/config';
import { patternPuzzleConfig } from './pattern-puzzle/config';
import { meiroTankenConfig } from './meiro-tanken/config';
import { kakurenboKatachiConfig } from './kakurenbo-katachi/config';
import { kotobaCatchConfig } from './kotoba-catch/config';
import { kimochiYomitoriConfig } from './kimochi-yomitori/config';
import { kimochiStopConfig } from './kimochi-stop/config';
import { touchDeGoConfig } from './touch-de-go/config';

export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  'hikari-catch': hikariCatchConfig,
  'matte-stop': matteStopConfig,
  'oboete-narabete': oboeteNarabeteConfig,
  'katachi-sagashi': katachiSagashiConfig,
  'irokae-switch': irokaeSwitchConfig,
  'hayawaza-touch': hayawazaTouchConfig,
  'oboete-match': oboeteMatchConfig,
  'tsumitage-tower': tsumitageTowerConfig,
  'pattern-puzzle': patternPuzzleConfig,
  'meiro-tanken': meiroTankenConfig,
  'kakurenbo-katachi': kakurenboKatachiConfig,
  'kotoba-catch': kotobaCatchConfig,
  'kimochi-yomitori': kimochiYomitoriConfig,
  'kimochi-stop': kimochiStopConfig,
  'touch-de-go': touchDeGoConfig,
};

export const GAME_LIST = [
  // 既存6ゲーム
  { id: 'hikari-catch' as GameId, domain: 'attention' as CognitiveDomain, name: 'ひかりキャッチ', description: 'ちゅうい' },
  { id: 'matte-stop' as GameId, domain: 'inhibition' as CognitiveDomain, name: 'まって！ストップ', description: 'がまん' },
  { id: 'oboete-narabete' as GameId, domain: 'working_memory' as CognitiveDomain, name: 'おぼえてならべて', description: 'おぼえる' },
  { id: 'katachi-sagashi' as GameId, domain: 'visuospatial' as CognitiveDomain, name: 'かたちさがし', description: 'かたち' },
  { id: 'irokae-switch' as GameId, domain: 'cognitive_flexibility' as CognitiveDomain, name: 'いろかえスイッチ', description: 'きりかえ' },
  { id: 'hayawaza-touch' as GameId, domain: 'processing_speed' as CognitiveDomain, name: 'はやわざタッチ', description: 'はやさ' },
  // 新規9ゲーム
  { id: 'oboete-match' as GameId, domain: 'memory' as CognitiveDomain, name: 'おぼえてマッチ', description: 'きおく' },
  { id: 'tsumitage-tower' as GameId, domain: 'planning' as CognitiveDomain, name: 'つみあげタワー', description: 'けいかく' },
  { id: 'pattern-puzzle' as GameId, domain: 'reasoning' as CognitiveDomain, name: 'パターンパズル', description: 'すいろん' },
  { id: 'meiro-tanken' as GameId, domain: 'problem_solving' as CognitiveDomain, name: 'めいろたんけん', description: 'もんだいかいけつ' },
  { id: 'kakurenbo-katachi' as GameId, domain: 'perceptual' as CognitiveDomain, name: 'かくれんぼカタチ', description: 'みつける' },
  { id: 'kotoba-catch' as GameId, domain: 'language' as CognitiveDomain, name: 'ことばキャッチ', description: 'ことば' },
  { id: 'kimochi-yomitori' as GameId, domain: 'social_cognition' as CognitiveDomain, name: 'きもちよみとり', description: 'きもち' },
  { id: 'kimochi-stop' as GameId, domain: 'emotion_regulation' as CognitiveDomain, name: 'きもちストップ', description: 'こころ' },
  { id: 'touch-de-go' as GameId, domain: 'motor_skills' as CognitiveDomain, name: 'タッチでGO!', description: 'うんどう' },
];
