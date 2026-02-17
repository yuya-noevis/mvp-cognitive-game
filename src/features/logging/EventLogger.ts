/**
 * EventLogger - 行動ログ収集
 *
 * 生ログをバッファリングし、一定数 or セッション終了時にフラッシュ。
 * ミリ秒粒度のタイムスタンプを記録。
 */

import type { GameEvent, EventType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { nowMs } from '@/lib/utils';

export interface EventLoggerConfig {
  bufferSize: number;        // バッファがこのサイズに達したらフラッシュ
  onFlush: (events: GameEvent[]) => Promise<void>;
}

const DEFAULT_CONFIG: EventLoggerConfig = {
  bufferSize: 20,
  onFlush: async () => {}, // No-op default (overridden with Supabase writer)
};

export class EventLogger {
  private config: EventLoggerConfig;
  private buffer: GameEvent[] = [];
  private sessionId: string | null = null;

  constructor(config?: Partial<EventLoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Set current session ID */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /** Log an event */
  async log(
    eventType: EventType,
    payload: Record<string, unknown> = {},
    trialId?: string,
  ): Promise<GameEvent> {
    const event: GameEvent = {
      id: uuidv4(),
      session_id: this.sessionId ?? '',
      trial_id: trialId,
      ts_ms: nowMs(),
      event_type: eventType,
      payload,
    };

    this.buffer.push(event);

    if (this.buffer.length >= this.config.bufferSize) {
      await this.flush();
    }

    return event;
  }

  /** Flush all buffered events */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const eventsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      await this.config.onFlush(eventsToFlush);
    } catch (error) {
      // Re-add events to buffer on failure (don't lose data)
      this.buffer = [...eventsToFlush, ...this.buffer];
      console.error('EventLogger flush failed:', error);
    }
  }

  /** Get buffered event count */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /** Reset logger */
  reset(): void {
    this.buffer = [];
    this.sessionId = null;
  }
}
