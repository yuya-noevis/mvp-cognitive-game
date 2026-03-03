import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssistLog, loadAssistLogs, clearAssistLogs } from '@/features/assist-log/useAssistLog';

// Mock nowMs for deterministic timing
vi.mock('@/lib/utils', () => ({
  nowMs: vi.fn(),
}));

import { nowMs } from '@/lib/utils';
const mockNowMs = nowMs as unknown as ReturnType<typeof vi.fn>;

describe('useAssistLog', () => {
  beforeEach(() => {
    // Reset mock
    mockNowMs.mockReturnValue(1000);
    // Clear localStorage
    clearAssistLogs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultOptions = {
    gameId: 'hikari-catch' as const,
    userId: 'child_abc123',
    instructionLevel: 'L2' as const,
  };

  it('should initialize with assist_mode off', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    expect(result.current.assistMode).toBe(false);
    expect(result.current.demoReplayCount).toBe(0);
    expect(result.current.confidence).toBe('high');
  });

  it('should toggle assist_mode on and off', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    act(() => {
      result.current.setAssistMode(true);
    });
    expect(result.current.assistMode).toBe(true);

    act(() => {
      result.current.setAssistMode(false);
    });
    expect(result.current.assistMode).toBe(false);
  });

  it('should update confidence when assist_mode changes', async () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    // Initially high (assist off)
    expect(result.current.confidence).toBe('high');

    // Turn on assist -> medium (0 replays)
    act(() => {
      result.current.setAssistMode(true);
    });
    // Wait for useEffect to update confidence
    await vi.waitFor(() => {
      expect(result.current.confidence).toBe('medium');
    });
  });

  it('should count demo replays', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    act(() => {
      result.current.recordDemoReplay();
    });
    expect(result.current.demoReplayCount).toBe(1);

    act(() => {
      result.current.recordDemoReplay();
    });
    expect(result.current.demoReplayCount).toBe(2);
  });

  it('should update confidence based on demo replay count', async () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    act(() => {
      result.current.setAssistMode(true);
    });

    // 0 replays -> medium
    await vi.waitFor(() => {
      expect(result.current.confidence).toBe('medium');
    });

    // 1 replay -> still medium
    act(() => {
      result.current.recordDemoReplay();
    });
    await vi.waitFor(() => {
      expect(result.current.confidence).toBe('medium');
    });

    // 2 replays -> low
    act(() => {
      result.current.recordDemoReplay();
    });
    await vi.waitFor(() => {
      expect(result.current.confidence).toBe('low');
    });
  });

  it('should reset demo replay count on session start', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    // Record some replays
    act(() => {
      result.current.recordDemoReplay();
      result.current.recordDemoReplay();
    });
    expect(result.current.demoReplayCount).toBe(2);

    // Start a new session
    act(() => {
      result.current.startSession('session-123');
    });
    expect(result.current.demoReplayCount).toBe(0);
  });

  it('should generate a complete log entry on finalize', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    // Set start time
    mockNowMs.mockReturnValue(1000);

    act(() => {
      result.current.setAssistMode(true);
      result.current.startSession('session-456');
    });

    act(() => {
      result.current.recordDemoReplay();
    });

    // Advance time by 5 seconds
    mockNowMs.mockReturnValue(6000);

    let entry: ReturnType<typeof result.current.finalizeLog> = null;
    act(() => {
      entry = result.current.finalizeLog();
    });

    expect(entry).not.toBeNull();
    expect(entry!.session_id).toBe('session-456');
    expect(entry!.game_id).toBe('hikari-catch');
    expect(entry!.user_id).toBe('child_abc123');
    expect(entry!.assist_mode).toBe(true);
    expect(entry!.demo_replay_count).toBe(1);
    expect(entry!.instruction_level).toBe('L2');
    expect(entry!.session_duration).toBe(5000);
    expect(entry!.time_of_day).toBeTruthy();
    expect(entry!.device_info).toBeTruthy();
    expect(entry!.confidence).toBe('medium');
  });

  it('should return null if session was not started', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    let entry: ReturnType<typeof result.current.finalizeLog> = null;
    act(() => {
      entry = result.current.finalizeLog();
    });

    expect(entry).toBeNull();
  });

  it('should save log entry to localStorage on finalize', () => {
    const { result } = renderHook(() => useAssistLog(defaultOptions));

    mockNowMs.mockReturnValue(1000);
    act(() => {
      result.current.startSession('session-789');
    });

    mockNowMs.mockReturnValue(3000);
    act(() => {
      result.current.finalizeLog();
    });

    const logs = loadAssistLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].session_id).toBe('session-789');
    expect(logs[0].confidence).toBe('high');
  });

  it('should handle missing userId gracefully', () => {
    const { result } = renderHook(() =>
      useAssistLog({
        ...defaultOptions,
        userId: undefined,
      }),
    );

    mockNowMs.mockReturnValue(1000);
    act(() => {
      result.current.startSession('session-no-user');
    });

    mockNowMs.mockReturnValue(2000);
    let entry: ReturnType<typeof result.current.finalizeLog> = null;
    act(() => {
      entry = result.current.finalizeLog();
    });

    expect(entry).not.toBeNull();
    expect(entry!.user_id).toBe('');
  });
});

describe('loadAssistLogs / clearAssistLogs', () => {
  beforeEach(() => {
    clearAssistLogs();
  });

  it('should return empty array when no logs exist', () => {
    const logs = loadAssistLogs();
    expect(logs).toEqual([]);
  });

  it('should clear all logs', () => {
    // Save a log via the hook, then clear
    localStorage.setItem('manas_assist_logs_v1', JSON.stringify([{ session_id: 'test' }]));
    expect(loadAssistLogs()).toHaveLength(1);

    clearAssistLogs();
    expect(loadAssistLogs()).toHaveLength(0);
  });
});
