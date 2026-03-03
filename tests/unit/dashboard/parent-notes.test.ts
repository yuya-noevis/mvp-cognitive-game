import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadNoteForWeek, saveNoteForWeek } from '@/components/dashboard/ParentNotes';

// ============================================================
// Mock localStorage
// ============================================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ============================================================
// Tests
// ============================================================

describe('ParentNotes storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns empty string for non-existent week note', () => {
    const note = loadNoteForWeek('2026-W10');
    expect(note).toBe('');
  });

  it('saves and loads a note for a specific week', () => {
    saveNoteForWeek('2026-W10', 'パズルが大好きです');
    const loaded = loadNoteForWeek('2026-W10');
    expect(loaded).toBe('パズルが大好きです');
  });

  it('updates an existing note', () => {
    saveNoteForWeek('2026-W10', '最初のメモ');
    saveNoteForWeek('2026-W10', '更新されたメモ');
    const loaded = loadNoteForWeek('2026-W10');
    expect(loaded).toBe('更新されたメモ');
  });

  it('stores notes for different weeks independently', () => {
    saveNoteForWeek('2026-W09', '先週のメモ');
    saveNoteForWeek('2026-W10', '今週のメモ');

    expect(loadNoteForWeek('2026-W09')).toBe('先週のメモ');
    expect(loadNoteForWeek('2026-W10')).toBe('今週のメモ');
  });

  it('handles empty text gracefully', () => {
    saveNoteForWeek('2026-W10', '');
    const loaded = loadNoteForWeek('2026-W10');
    expect(loaded).toBe('');
  });

  it('persists to localStorage with correct key', () => {
    saveNoteForWeek('2026-W10', 'テスト');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'manas-parent-notes',
      expect.any(String),
    );

    // Verify the stored data structure
    const stored = JSON.parse(
      localStorageMock.setItem.mock.calls[0][1] as string,
    );
    expect(stored).toBeInstanceOf(Array);
    expect(stored[0].weekKey).toBe('2026-W10');
    expect(stored[0].text).toBe('テスト');
    expect(stored[0].updatedAt).toBeGreaterThan(0);
  });

  it('limits stored notes to 52 weeks', () => {
    // Save 55 notes
    for (let i = 1; i <= 55; i++) {
      saveNoteForWeek(
        `2026-W${String(i).padStart(2, '0')}`,
        `メモ ${i}`,
      );
    }

    // Verify the stored data doesn't exceed 52 entries
    const lastCall = localStorageMock.setItem.mock.calls.at(-1);
    const stored = JSON.parse(lastCall![1] as string);
    expect(stored.length).toBeLessThanOrEqual(52);
  });
});
