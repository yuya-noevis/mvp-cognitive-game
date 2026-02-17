import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventLogger } from '@/features/logging/EventLogger';

describe('EventLogger', () => {
  let logger: EventLogger;
  const mockFlush = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockFlush.mockClear();
    logger = new EventLogger({
      bufferSize: 3,
      onFlush: mockFlush,
    });
    logger.setSessionId('test-session-123');
  });

  it('should log events with correct structure', async () => {
    const event = await logger.log('trial_start', { trial_number: 1 }, 'trial-123');

    expect(event.session_id).toBe('test-session-123');
    expect(event.trial_id).toBe('trial-123');
    expect(event.event_type).toBe('trial_start');
    expect(event.payload).toEqual({ trial_number: 1 });
    expect(event.ts_ms).toBeGreaterThan(0);
    expect(event.id).toBeTruthy();
  });

  it('should buffer events until buffer size is reached', async () => {
    await logger.log('trial_start', {});
    expect(mockFlush).not.toHaveBeenCalled();
    expect(logger.getBufferSize()).toBe(1);

    await logger.log('stimulus_presented', {});
    expect(mockFlush).not.toHaveBeenCalled();
    expect(logger.getBufferSize()).toBe(2);

    // Third event triggers flush (bufferSize=3)
    await logger.log('response', {});
    expect(mockFlush).toHaveBeenCalledOnce();
    expect(mockFlush).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ event_type: 'trial_start' }),
      expect.objectContaining({ event_type: 'stimulus_presented' }),
      expect.objectContaining({ event_type: 'response' }),
    ]));
  });

  it('should flush manually', async () => {
    await logger.log('trial_start', {});
    await logger.flush();

    expect(mockFlush).toHaveBeenCalledOnce();
    expect(logger.getBufferSize()).toBe(0);
  });

  it('should not flush when buffer is empty', async () => {
    await logger.flush();
    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('should re-buffer events on flush failure', async () => {
    const failFlush = vi.fn().mockRejectedValue(new Error('network error'));
    const failLogger = new EventLogger({
      bufferSize: 10,
      onFlush: failFlush,
    });
    failLogger.setSessionId('test');

    await failLogger.log('trial_start', {});
    await failLogger.flush();

    // Events should be re-added to buffer
    expect(failLogger.getBufferSize()).toBe(1);
  });

  it('should reset properly', () => {
    logger.log('trial_start', {});
    logger.reset();

    expect(logger.getBufferSize()).toBe(0);
  });
});
