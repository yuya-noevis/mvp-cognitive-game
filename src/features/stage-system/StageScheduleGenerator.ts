import type { AgeGroup, CognitiveDomain, GameId } from '@/types';
import type { StageGameState } from './types';
import type { MasteryTracker } from './MasteryTracker';
import {
  GAMES_PER_STAGE_BY_AGE,
  TRIALS_PER_GAME_BY_AGE,
} from '@/lib/constants';
import {
  generatePersonalizedDomainOrder,
  selectGamesForStage,
  DOMAIN_TO_GAME,
} from '@/lib/stage-config';
import { nowMs } from '@/lib/utils';

/**
 * StageScheduleGenerator - ステージのゲーム構成を生成
 *
 * 設計根拠：
 * - TEACCH原則: ビジュアルスケジュール生成
 * - 行動モメンタム理論 (Nevin et al., 1983): 得意→苦手のサンドイッチ配置
 * - 間隔反復 (Settles & Meeder, 2016): 復習ゲーム挿入
 */
export class StageScheduleGenerator {
  private masteryTracker: MasteryTracker;

  constructor(masteryTracker: MasteryTracker) {
    this.masteryTracker = masteryTracker;
  }

  /**
   * ステージのゲーム構成を生成
   */
  generateStageGames(
    ageGroup: AgeGroup,
    stageNumber: number,
  ): StageGameState[] {
    // 1. 習熟度から個人化されたドメイン順序を取得
    const progressSummary = this.masteryTracker.getProgressSummary();
    const domainAccuracies: Partial<Record<CognitiveDomain, number>> = {};
    for (const [domain, data] of Object.entries(progressSummary)) {
      domainAccuracies[domain as CognitiveDomain] = data.lastAccuracy;
    }

    const domainOrder = generatePersonalizedDomainOrder(domainAccuracies);

    // 2. 復習が必要なドメインを取得
    const reviewDomains = this.masteryTracker.getDomainsNeedingReview(nowMs());

    // 3. ステージ用ゲームを選択
    const selectedGames = selectGamesForStage(ageGroup, domainOrder, reviewDomains);

    // 4. ステージ番号に基づくオフセット（同じドメインばかりにならない）
    const offset = (stageNumber - 1) * GAMES_PER_STAGE_BY_AGE[ageGroup].min;
    const offsetGames = this.applyStageOffset(selectedGames, domainOrder, offset);

    // 5. StageGameState に変換
    const trialRange = TRIALS_PER_GAME_BY_AGE[ageGroup];

    return offsetGames.map(g => ({
      gameId: g.gameId,
      domain: g.domain,
      trialCount: this.getTrialCount(g.gameId, ageGroup, trialRange),
      isReview: g.isReview,
      isCompleted: false,
      accuracy: 0,
      trialsCompleted: 0,
    }));
  }

  /**
   * ステージオフセットを適用（ステージごとに異なるドメインの組み合わせ）
   */
  private applyStageOffset(
    games: { gameId: GameId; domain: CognitiveDomain; isReview: boolean }[],
    domainOrder: CognitiveDomain[],
    offset: number,
  ): { gameId: GameId; domain: CognitiveDomain; isReview: boolean }[] {
    // 復習ゲームはそのまま残す
    const reviewGames = games.filter(g => g.isReview);
    const newGames = games.filter(g => !g.isReview);

    // オフセットを適用して新しいドメインから選択
    const usedDomains = new Set([
      ...reviewGames.map(g => g.domain),
      ...newGames.map(g => g.domain),
    ]);

    const availableDomains = domainOrder.filter(d => !usedDomains.has(d));

    // オフセット分だけ進めた位置から取得
    for (let i = 0; i < newGames.length && i < availableDomains.length; i++) {
      const domainIdx = (offset + i) % domainOrder.length;
      const domain = domainOrder[domainIdx];
      if (!reviewGames.some(g => g.domain === domain)) {
        newGames[i] = {
          gameId: DOMAIN_TO_GAME[domain],
          domain,
          isReview: false,
        };
      }
    }

    return [...reviewGames, ...newGames];
  }

  /**
   * ゲームの試行数を決定
   * GameConfig に stage_trial_count があればそれを使い、なければ年齢デフォルト
   */
  private getTrialCount(
    _gameId: GameId,
    _ageGroup: AgeGroup,
    trialRange: { min: number; max: number },
  ): number {
    // 中央値を使用
    return Math.round((trialRange.min + trialRange.max) / 2);
  }

  /**
   * 指定されたゲームIDリストからステージを生成（手動選択用）
   */
  generateFromGameList(
    gameIds: GameId[],
    ageGroup: AgeGroup,
  ): StageGameState[] {
    const trialRange = TRIALS_PER_GAME_BY_AGE[ageGroup];

    return gameIds.map(gameId => {
      const domain = Object.entries(DOMAIN_TO_GAME).find(
        ([, gId]) => gId === gameId,
      )?.[0] as CognitiveDomain ?? 'attention';

      return {
        gameId,
        domain,
        trialCount: this.getTrialCount(gameId, ageGroup, trialRange),
        isReview: false,
        isCompleted: false,
        accuracy: 0,
        trialsCompleted: 0,
      };
    });
  }
}
