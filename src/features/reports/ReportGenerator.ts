/**
 * ReportGenerator - レポート生成
 *
 * 安全設計：
 * - 断定表現を避ける（「低い」「障害」「診断」は禁止）
 * - 「昨日の自分比」で表現し、他者比較を排除
 * - 免責表示を必ず含める
 * - トレンドは3段階: improving / stable / needs_support
 */

import type { ReportContent, ReportDomainEntry, CognitiveDomain, DailyMetric } from '@/types';
import { DOMAIN_LABELS, REPORT_DISCLAIMER } from '@/lib/constants';

interface ReportInput {
  metrics: DailyMetric[];
  previousMetrics?: DailyMetric[]; // 前期間の指標（比較用）
}

export function generateReport(input: ReportInput): ReportContent {
  const { metrics, previousMetrics } = input;

  // Group metrics by domain
  const domainGroups = groupByDomain(metrics);
  const prevDomainGroups = previousMetrics ? groupByDomain(previousMetrics) : {};

  const domains: ReportDomainEntry[] = [];

  for (const [domain, domainMetrics] of Object.entries(domainGroups)) {
    const prevMetrics = prevDomainGroups[domain];
    const entry = generateDomainEntry(
      domain as CognitiveDomain,
      domainMetrics,
      prevMetrics,
    );
    domains.push(entry);
  }

  // Generate recommendations based on trends
  const recommendations = generateRecommendations(domains);

  // Generate summary
  const improvingCount = domains.filter(d => d.trend === 'improving').length;
  const needsSupportCount = domains.filter(d => d.trend === 'needs_support').length;

  let summary: string;
  if (improvingCount > 0 && needsSupportCount === 0) {
    summary = 'がんばりの成果が見られています。この調子で続けましょう。';
  } else if (needsSupportCount > 0) {
    summary = 'いくつかの領域でサポートがあると良さそうです。無理のないペースで取り組みましょう。';
  } else {
    summary = '安定して取り組めています。引き続き楽しみながら続けましょう。';
  }

  return {
    summary,
    domains,
    recommendations,
    disclaimer: REPORT_DISCLAIMER,
  };
}

function generateDomainEntry(
  domain: CognitiveDomain,
  metrics: DailyMetric[],
  prevMetrics?: DailyMetric[],
): ReportDomainEntry {
  // Determine trend by comparing with previous period
  const trend = determineTrend(metrics, prevMetrics);

  // Generate trend description (no absolute judgments, only relative change)
  const trendDescription = generateTrendDescription(domain, trend);

  // Build metric display values
  const displayMetrics = metrics.map(m => ({
    name: m.metric_name,
    label: getMetricLabel(m.metric_name),
    value: Math.round(m.value * 100) / 100,
    unit: getMetricUnit(m.metric_name),
  }));

  // Use the lowest confidence level among metrics
  const confidence = metrics.some(m => m.confidence === 'hypothesis')
    ? 'hypothesis' as const
    : metrics.some(m => m.confidence === 'low_trial_count')
      ? 'low_trial_count' as const
      : 'standard' as const;

  return {
    domain,
    domain_label: DOMAIN_LABELS[domain] || domain,
    trend,
    trend_description: trendDescription,
    metrics: displayMetrics,
    confidence,
  };
}

function determineTrend(
  current: DailyMetric[],
  previous?: DailyMetric[],
): 'improving' | 'stable' | 'needs_support' {
  if (!previous || previous.length === 0) return 'stable';

  // Compare primary metric (first metric by convention)
  const currentPrimary = current[0]?.value ?? 0;
  const prevPrimary = previous.find(p => p.metric_name === current[0]?.metric_name)?.value ?? 0;

  const changeRatio = prevPrimary > 0 ? (currentPrimary - prevPrimary) / prevPrimary : 0;

  if (changeRatio > 0.05) return 'improving';
  if (changeRatio < -0.1) return 'needs_support';
  return 'stable';
}

function generateTrendDescription(domain: CognitiveDomain, trend: string): string {
  const label = DOMAIN_LABELS[domain] || domain;

  switch (trend) {
    case 'improving':
      return `${label}の領域で、前回からの変化が見られました。`;
    case 'needs_support':
      return `${label}の領域は、サポートがあるとさらに取り組みやすくなりそうです。`;
    default:
      return `${label}の領域は、安定して取り組めています。`;
  }
}

function generateRecommendations(domains: ReportDomainEntry[]): string[] {
  const recs: string[] = [];

  const needsSupport = domains.filter(d => d.trend === 'needs_support');
  if (needsSupport.length > 0) {
    recs.push(`${needsSupport.map(d => d.domain_label).join('、')}の領域は、短い時間で無理なく取り組むのがおすすめです。`);
  }

  const improving = domains.filter(d => d.trend === 'improving');
  if (improving.length > 0) {
    recs.push(`${improving.map(d => d.domain_label).join('、')}では良い変化が見られています。引き続き楽しみながら取り組みましょう。`);
  }

  recs.push('お子さまのペースを大切に、楽しんで取り組める範囲で続けてください。');

  return recs;
}

function groupByDomain(metrics: DailyMetric[]): Record<string, DailyMetric[]> {
  const groups: Record<string, DailyMetric[]> = {};
  for (const m of metrics) {
    if (!groups[m.domain]) groups[m.domain] = [];
    groups[m.domain].push(m);
  }
  return groups;
}

function getMetricLabel(name: string): string {
  const labels: Record<string, string> = {
    hit_rate: '正しくタップできた割合',
    false_alarm_rate: 'まちがえてタップした割合',
    avg_rt_ms: '反応の速さ',
    commission_error_rate: 'がまんが難しかった割合',
    span: '覚えられた数',
    accuracy: '正しくできた割合',
    switch_cost_rt: 'きりかえの速さ',
    perseverative_error_rate: '前のルールを使った割合',
  };
  return labels[name] || name;
}

function getMetricUnit(name: string): string {
  if (name.includes('rate') || name === 'accuracy') return '%';
  if (name.includes('rt') || name.includes('ms')) return 'ms';
  if (name === 'span') return '個';
  return '';
}
