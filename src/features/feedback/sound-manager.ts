// MVPでは Web Audio API で短い合成音を生成
// 将来: 録音音声ファイルに置換可能

export class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /** 正解音: 短い高音「ding」(200ms) */
  playCorrect(volume: number = 0.7): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // A5
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** 連続正解ブースト音: 上昇音（300ms） */
  playStreak(volume: number = 0.7): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);    // C5
    osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.3); // C6
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /** 不正解音: 柔らかい低音「ポン」(150ms) — L2以上のみ */
  playIncorrect(volume: number = 0.3): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 220; // A3（低く柔らかい）
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime); // 正解より小さい音量
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
}

export const soundManager = new SoundManager();
