'use client';

import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'manas-parent-notes';

interface WeeklyNote {
  weekKey: string; // YYYY-Www format
  text: string;
  updatedAt: number;
}

function getCurrentWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000,
  );
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function loadNotes(): WeeklyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WeeklyNote[];
  } catch {
    return [];
  }
}

function saveNotes(notes: WeeklyNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore quota errors
  }
}

export function loadNoteForWeek(weekKey: string): string {
  const notes = loadNotes();
  return notes.find((n) => n.weekKey === weekKey)?.text ?? '';
}

export function saveNoteForWeek(weekKey: string, text: string): void {
  const notes = loadNotes();
  const existing = notes.find((n) => n.weekKey === weekKey);
  if (existing) {
    existing.text = text;
    existing.updatedAt = Date.now();
  } else {
    notes.unshift({ weekKey, text, updatedAt: Date.now() });
  }
  // Keep last 52 weeks of notes
  if (notes.length > 52) notes.length = 52;
  saveNotes(notes);
}

interface ParentNotesProps {
  weekKey?: string;
}

/**
 * Parent notes component.
 * Allows parents to write weekly notes about their child's behavior at home.
 * Data is stored in localStorage, one note per week.
 * Auto-saves on blur / after a debounce.
 */
export function ParentNotes({ weekKey }: ParentNotesProps) {
  const currentWeek = weekKey ?? getCurrentWeekKey();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadNoteForWeek(currentWeek);
    setText(loaded);
  }, [currentWeek]);

  const handleSave = useCallback(() => {
    saveNoteForWeek(currentWeek, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [currentWeek, text]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: 'rgba(42, 42, 90, 0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold" style={{ color: '#B8B8D0' }}>
          保護者メモ
        </p>
        {saved && (
          <span
            className="text-xs px-2 py-0.5 rounded-full animate-fade-in"
            style={{ background: 'rgba(46, 213, 115, 0.15)', color: '#2ED573' }}
          >
            保存しました
          </span>
        )}
      </div>

      <p className="text-xs mb-2" style={{ color: '#8888AA' }}>
        今週気になったこと・家での様子を記録できます
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="例：最近パズルが好きで集中して遊んでいます"
        rows={3}
        className="w-full rounded-xl p-3 text-sm resize-none outline-none transition-colors"
        style={{
          background: 'rgba(13, 13, 43, 0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#F0F0FF',
          fontSize: '16px', // Prevent iOS zoom
        }}
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: '#8888AA' }}>
          {currentWeek}
        </span>
        <button
          onClick={handleSave}
          className="text-xs px-3 py-1 rounded-full transition-colors"
          style={{
            background: 'rgba(108, 60, 225, 0.15)',
            color: '#8B5CF6',
            border: '1px solid rgba(108, 60, 225, 0.25)',
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
}
