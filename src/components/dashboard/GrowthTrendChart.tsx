'use client';

import React, { useState } from 'react';
import type { WeeklyTrendPoint } from './dashboard-data';
import { CATEGORY_COLORS, CATEGORY_DISPLAY_NAMES, ALL_CATEGORIES } from './dashboard-data';
import type { CognitiveCategory } from '@/games/integrated/types';

interface GrowthTrendChartProps {
  data: WeeklyTrendPoint[];
  height?: number;
}

/**
 * Weekly growth trend line chart (SVG-based).
 * Shows per-category accuracy trends over weeks.
 * Tap on legend to toggle category visibility.
 */
export function GrowthTrendChart({ data, height = 200 }: GrowthTrendChartProps) {
  const [visibleCategories, setVisibleCategories] = useState<Set<CognitiveCategory>>(
    new Set(ALL_CATEGORIES),
  );

  const width = 340;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Filter to weeks that have at least some data
  const hasData = data.some((w) =>
    ALL_CATEGORIES.some((cat) => w.categories[cat] > 0),
  );

  if (!hasData || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl p-6"
        style={{
          height,
          background: 'rgba(42, 42, 90, 0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-sm" style={{ color: '#8888AA' }}>
          データがたまると成長グラフが表示されます
        </p>
      </div>
    );
  }

  // Y axis: 0-100
  const yMin = 0;
  const yMax = 100;
  const yTicks = [0, 25, 50, 75, 100];

  function xPos(index: number): number {
    if (data.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (data.length - 1)) * chartW;
  }

  function yPos(value: number): number {
    return padding.top + chartH - ((value - yMin) / (yMax - yMin)) * chartH;
  }

  function buildLinePath(cat: CognitiveCategory): string {
    const points = data.map((w, i) => ({
      x: xPos(i),
      y: yPos(w.categories[cat]),
      value: w.categories[cat],
    }));

    // Only draw segments between non-zero points
    let path = '';
    let started = false;
    for (const p of points) {
      if (p.value === 0) {
        started = false;
        continue;
      }
      if (!started) {
        path += `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        started = true;
      } else {
        path += ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }
    }
    return path;
  }

  function toggleCategory(cat: CognitiveCategory) {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        // Don't allow hiding all
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  // Week comparison: last vs second to last
  const lastWeek = data[data.length - 1];
  const prevWeek = data.length >= 2 ? data[data.length - 2] : null;

  return (
    <div className="space-y-3">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y grid lines and labels */}
        {yTicks.map((tick) => (
          <g key={`ytick-${tick}`}>
            <line
              x1={padding.left}
              y1={yPos(tick)}
              x2={width - padding.right}
              y2={yPos(tick)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 6}
              y={yPos(tick) + 3}
              textAnchor="end"
              fill="#8888AA"
              fontSize="9"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X labels (week) */}
        {data.map((w, i) => (
          <text
            key={`xlabel-${i}`}
            x={xPos(i)}
            y={height - 4}
            textAnchor="middle"
            fill="#8888AA"
            fontSize="9"
          >
            {w.weekLabel}
          </text>
        ))}

        {/* Lines */}
        {ALL_CATEGORIES.map((cat) => {
          if (!visibleCategories.has(cat)) return null;
          const path = buildLinePath(cat);
          if (!path) return null;
          return (
            <path
              key={`line-${cat}`}
              d={path}
              fill="none"
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          );
        })}

        {/* Dots on latest week */}
        {ALL_CATEGORIES.map((cat) => {
          if (!visibleCategories.has(cat)) return null;
          const val = lastWeek.categories[cat];
          if (val === 0) return null;
          return (
            <circle
              key={`dot-${cat}`}
              cx={xPos(data.length - 1)}
              cy={yPos(val)}
              r={3.5}
              fill={CATEGORY_COLORS[cat]}
              stroke="rgba(13, 13, 43, 0.8)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* Legend (tappable) */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALL_CATEGORIES.map((cat) => {
          const isVisible = visibleCategories.has(cat);
          return (
            <button
              key={`legend-${cat}`}
              onClick={() => toggleCategory(cat)}
              className="flex items-center gap-1 px-2 py-1 rounded-full transition-opacity"
              style={{
                background: isVisible
                  ? `${CATEGORY_COLORS[cat]}15`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isVisible ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.08)'}`,
                opacity: isVisible ? 1 : 0.4,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: CATEGORY_COLORS[cat] }}
              />
              <span
                className="text-xs"
                style={{ color: isVisible ? '#F0F0FF' : '#8888AA' }}
              >
                {CATEGORY_DISPLAY_NAMES[cat]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Week-over-week summary */}
      {prevWeek && (
        <div className="flex items-center justify-center gap-1 text-xs" style={{ color: '#B8B8D0' }}>
          <span>前週比:</span>
          {(() => {
            const change = lastWeek.overallAccuracy - prevWeek.overallAccuracy;
            if (change > 0) {
              return (
                <span style={{ color: '#2ED573' }}>
                  +{change}%
                </span>
              );
            } else if (change < 0) {
              return (
                <span style={{ color: '#FFD43B' }}>
                  {change}%
                </span>
              );
            }
            return <span>変動なし</span>;
          })()}
        </div>
      )}
    </div>
  );
}
