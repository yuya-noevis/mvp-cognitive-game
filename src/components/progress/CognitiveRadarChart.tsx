'use client';

import React, { useMemo } from 'react';

interface CategoryData {
  /** カテゴリ名 */
  label: string;
  /** 「得意」スコア (0-100) */
  strength: number;
  /** 「伸びしろ」スコア (0-100) — 得意の反転ではなく独立した指標 */
  potential: number;
}

interface CognitiveRadarChartProps {
  /** 5カテゴリのデータ */
  categories: CategoryData[];
  /** チャートのサイズ (px) */
  size?: number;
  className?: string;
}

/**
 * CognitiveRadarChart - 認知プロファイルレーダーチャート（保護者向け）
 *
 * 5カテゴリのレーダーチャート。
 * 「得意」と「伸びしろ」の2軸で表示。
 * 「苦手」「弱い」は使わない。
 */
export function CognitiveRadarChart({
  categories,
  size = 280,
  className = '',
}: CognitiveRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const labelRadius = size * 0.48;
  const n = categories.length;

  const points = useMemo(() => {
    return categories.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return { angle, cos: Math.cos(angle), sin: Math.sin(angle) };
    });
  }, [categories, n]);

  // Generate polygon path for a given set of values
  const makePolygonPath = (values: number[]) => {
    return values
      .map((v, i) => {
        const r = (v / 100) * maxRadius;
        const x = cx + r * points[i].cos;
        const y = cy + r * points[i].sin;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [25, 50, 75, 100];

  const strengthPath = makePolygonPath(categories.map(c => c.strength));
  const potentialPath = makePolygonPath(categories.map(c => c.potential));

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map(pct => {
          const r = (pct / 100) * maxRadius;
          const gridPoints = points
            .map(p => `${cx + r * p.cos},${cy + r * p.sin}`)
            .join(' ');
          return (
            <polygon
              key={pct}
              points={gridPoints}
              fill="none"
              stroke="rgba(136, 136, 170, 0.15)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxRadius * p.cos}
            y2={cy + maxRadius * p.sin}
            stroke="rgba(136, 136, 170, 0.1)"
            strokeWidth={1}
          />
        ))}

        {/* Potential area (outer, lighter) */}
        <polygon
          points={potentialPath}
          fill="rgba(78, 205, 196, 0.1)"
          stroke="rgba(78, 205, 196, 0.4)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Strength area (inner, more vivid) */}
        <polygon
          points={strengthPath}
          fill="rgba(108, 60, 225, 0.2)"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth={2}
        />

        {/* Data points on strength polygon */}
        {categories.map((cat, i) => {
          const r = (cat.strength / 100) * maxRadius;
          const x = cx + r * points[i].cos;
          const y = cy + r * points[i].sin;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill="#8B5CF6"
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat, i) => {
          const x = cx + labelRadius * points[i].cos;
          const y = cy + labelRadius * points[i].sin;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#B8B8D0"
              fontSize={11}
              fontWeight={600}
              fontFamily="'Zen Maru Gothic', sans-serif"
            >
              {cat.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: 'rgba(139, 92, 246, 0.6)' }}
          />
          <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>
            とくい
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              background: 'rgba(78, 205, 196, 0.3)',
              border: '1px dashed rgba(78, 205, 196, 0.6)',
            }}
          />
          <span className="text-xs font-bold" style={{ color: '#4ECDC4' }}>
            のびしろ
          </span>
        </div>
      </div>
    </div>
  );
}
