'use client';

import React from 'react';
import type { CategoryScoreSnapshot } from './dashboard-data';
import { CATEGORY_COLORS, ALL_CATEGORIES, CATEGORY_DISPLAY_NAMES } from './dashboard-data';

interface CognitiveRadarChartProps {
  scores: CategoryScoreSnapshot[];
  /** Optional: previous scores to show "growth" (伸びしろ) as second axis */
  previousScores?: CategoryScoreSnapshot[];
  size?: number;
}

/**
 * 5-category SVG radar chart for the parent dashboard.
 * Shows "得意" (strengths) with filled area and "伸びしろ" (growth potential)
 * as a dashed outline when previous scores are provided.
 *
 * Strengths-Based: uses positive framing only.
 */
export function CognitiveRadarChart({
  scores,
  previousScores,
  size = 280,
}: CognitiveRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const labelRadius = size * 0.47;
  const categories = ALL_CATEGORIES;
  const angleStep = (2 * Math.PI) / categories.length;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  // Score map for easy lookup
  const scoreMap: Record<string, number> = {};
  for (const s of scores) {
    scoreMap[s.category] = s.score;
  }

  const prevScoreMap: Record<string, number> = {};
  if (previousScores) {
    for (const s of previousScores) {
      prevScoreMap[s.category] = s.score;
    }
  }

  // Get point on radar for a given category index and value (0-100)
  function getPoint(index: number, value: number): { x: number; y: number } {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Build polygon path from scores
  function buildPath(map: Record<string, number>): string {
    return categories
      .map((cat, i) => {
        const val = map[cat] ?? 0;
        const { x, y } = getPoint(i, val);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  }

  // Grid lines at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background grid */}
        {gridLevels.map((level) => (
          <polygon
            key={`grid-${level}`}
            points={categories
              .map((_, i) => {
                const { x, y } = getPoint(i, level);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, i) => {
          const { x, y } = getPoint(i, 100);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Growth potential area (previous scores - shown as dashed) */}
        {previousScores && previousScores.length > 0 && (
          <path
            d={buildPath(prevScoreMap)}
            fill="rgba(255, 212, 59, 0.08)"
            stroke="rgba(255, 212, 59, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {/* Current scores area */}
        <path
          d={buildPath(scoreMap)}
          fill="rgba(108, 60, 225, 0.2)"
          stroke="#8B5CF6"
          strokeWidth="2"
        />

        {/* Score dots */}
        {categories.map((cat, i) => {
          const val = scoreMap[cat] ?? 0;
          const { x, y } = getPoint(i, val);
          const color = CATEGORY_COLORS[cat];
          return (
            <circle
              key={`dot-${cat}`}
              cx={x}
              cy={y}
              r={4}
              fill={color}
              stroke="rgba(13, 13, 43, 0.8)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat, i) => {
          const angle = startAngle + i * angleStep;
          const lx = cx + labelRadius * Math.cos(angle);
          const ly = cy + labelRadius * Math.sin(angle);
          const val = scoreMap[cat] ?? 0;
          const color = CATEGORY_COLORS[cat];

          // Adjust text anchor based on position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';
          else if (Math.cos(angle) > 0.3) textAnchor = 'start';

          return (
            <g key={`label-${cat}`}>
              <text
                x={lx}
                y={ly - 6}
                textAnchor={textAnchor}
                fill="#B8B8D0"
                fontSize="10"
                fontWeight="500"
              >
                {CATEGORY_DISPLAY_NAMES[cat]}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor={textAnchor}
                fill={color}
                fontSize="12"
                fontWeight="700"
              >
                {val > 0 ? val : '-'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-1.5 rounded-full"
            style={{ background: '#8B5CF6' }}
          />
          <span className="text-xs" style={{ color: '#B8B8D0' }}>
            得意
          </span>
        </div>
        {previousScores && previousScores.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-1.5 rounded-full"
              style={{
                background: 'transparent',
                border: '1px dashed rgba(255, 212, 59, 0.6)',
              }}
            />
            <span className="text-xs" style={{ color: '#B8B8D0' }}>
              伸びしろ
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
