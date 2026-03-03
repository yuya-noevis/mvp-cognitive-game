/**
 * SoundManager - Web Audio API を使った合成音フィードバック
 *
 * 設計書v3仕様:
 * - 正解音: 短い高音「ding」(200ms以内)、440-880Hzの中音域
 * - 不正解音: なし（無音が基本）。L2以上で低音の軽い「boop」(150ms)
 * - アタック 20ms 以上、リリース 200ms 以上（感覚過敏対応）
 * - 音量は感覚過敏設定の5段階に連動
 *
 * 将来: 録音音声ファイルに置換可能
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    // AudioContext が suspended の場合は再開（ユーザー操作後のみ有効）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {/* ignore */});
    }
    return this.audioContext;
  }

  /**
   * 正解音: 短い高音「ding」
   * - 周波数: 880Hz (A5)  ← 440-880Hzの中音域上限、明るく爽快
   * - アタック: 20ms
   * - リリース: 200ms
   * - 合計: ~220ms (200ms以内に収まる設計)
   */
  playCorrect(volume: number = 0.7): void {
    if (volume <= 0) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 880; // A5 — 明るく短い「ding」
      osc.type = 'sine';

      // アタック 20ms → 感覚過敏対応（急激な立ち上がりを避ける）
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      // リリース 200ms
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } catch {/* AudioContext 未対応環境では無視 */}
  }

  /**
   * 連続正解ブースト音: 上昇音「チャーン」
   * - 周波数: 523Hz(C5) → 1047Hz(C6) の上昇グライド
   * - アタック: 20ms
   * - リリース: 300ms
   */
  playStreak(volume: number = 0.7): void {
    if (volume <= 0) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(523, ctx.currentTime);      // C5
      osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.3); // C6
      osc.type = 'sine';

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {/* ignore */}
  }

  /**
   * 不正解音: 柔らかい低音「boop」— L2以上のみ呼ばれる
   * - 周波数: 220Hz (A3) — 低く穏やか、罰感なし
   * - アタック: 20ms
   * - リリース: 200ms (150ms本体 + 余韻)
   * - 音量は正解の半分以下
   *
   * L1（非言語モード）では soundEnabled = false のため、このメソッドは呼ばれない。
   */
  playIncorrect(volume: number = 0.3): void {
    if (volume <= 0) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 220; // A3 — 低く柔らかい
      osc.type = 'sine';

      // 音量は正解より小さく（罰感ゼロ設計）
      const quietVolume = Math.min(volume * 0.5, 0.25);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(quietVolume, ctx.currentTime + 0.02);
      // リリース: 200ms以上（感覚過敏対応）
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } catch {/* ignore */}
  }

  /**
   * ユーザー操作時に呼び出して AudioContext を事前初期化する。
   * iOS/Safari では最初のユーザージェスチャー中に AudioContext を
   * resume しないと音が出ないため、ゲーム開始ボタン押下時に呼ぶ。
   */
  warmup(): void {
    try {
      const ctx = this.getContext();
      // Silent buffer を再生して iOS のオーディオロックを解除
      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {/* AudioContext 未対応環境では無視 */}
  }
}

export const soundManager = new SoundManager();
