'use client';

import { useMemo } from 'react';
import { TeamStats } from '../types/type';
import { ProgressBar, ComparisonBar } from '@/components/ui/ProgressBar';
import { MIN_LABEL_PCT } from '../constants/stats';

const StatCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">{title}</h3>
    {children}
  </section>
);

// 汎用行
const ResultRow = ({
  label,
  value,
  pct,
  children,
  subtitle,
}: {
  label: string;
  value: number;
  pct?: number;
  children?: React.ReactNode;
  subtitle?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-bold">{value}</span>
        {pct !== undefined && <span className="text-xs text-gray-500">({pct}%)</span>}
      </div>
    </div>
    {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    {children}
  </div>
);

// 小ボックス
const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <div className="text-lg font-bold">{value}</div>
    <div className="text-sm">{label}</div>
  </div>
);

/**
 * チーム統計表示コンポーネント
 */
export default function TeamStatsView({ stats }: { stats: TeamStats }) {
  const { fixtures, goals } = stats;

  const topFormations = useMemo(
    () => [...(stats.lineups ?? [])].sort((a, b) => b.played - a.played).slice(0, 3),
    [stats.lineups]
  );

  const total = fixtures.played.total;
  const rates = {
    win: Math.round((fixtures.wins.total / total) * 100),
    draw: Math.round((fixtures.draws.total / total) * 100),
    lose: Math.round((fixtures.loses.total / total) * 100),
  };

  return (
    <div className="space-y-6">
      {/* ----- 試合成績 ＆ 得点 ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 試合成績 */}
        <StatCard title="試合成績">
          <div className="space-y-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">総試合数</span>
              <span className="font-bold">{total}</span>
            </div>

            {/* 勝 / 分 / 敗 */}
            <ResultRow label="勝利" value={fixtures.wins.total} pct={rates.win}>
              <ComparisonBar
                value1={fixtures.wins.home}
                value2={fixtures.wins.away}
                color1="#16a34a"
                color2="#9ca3af"
                minLabelPct={MIN_LABEL_PCT}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>H: {fixtures.wins.home}</span>
                <span>A: {fixtures.wins.away}</span>
              </div>
            </ResultRow>

            <ResultRow label="引き分け" value={fixtures.draws.total} pct={rates.draw}>
              <ComparisonBar
                value1={fixtures.draws.home}
                value2={fixtures.draws.away}
                color1="#696969"
                color2="#9ca3af"
                minLabelPct={MIN_LABEL_PCT}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>H: {fixtures.draws.home}</span>
                <span>A: {fixtures.draws.away}</span>
              </div>
            </ResultRow>

            <ResultRow label="敗北" value={fixtures.loses.total} pct={rates.lose}>
              <ComparisonBar
                value1={fixtures.loses.home}
                value2={fixtures.loses.away}
                color1="#dc2626"
                color2="#9ca3af"
                minLabelPct={MIN_LABEL_PCT}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>H: {fixtures.loses.home}</span>
                <span>A: {fixtures.loses.away}</span>
              </div>
            </ResultRow>
          </div>
        </StatCard>

        {/* 得点情報 */}
        <StatCard title="得点情報">
          <div className="space-y-4">
            <ResultRow
              label="総得点"
              value={goals.for.total.total}
              subtitle={<>平均: {goals.for.average.total}/試合</>}
            >
              <ComparisonBar
                value1={goals.for.total.home}
                value2={goals.for.total.away}
                color1="#0000cd"
                color2="#9ca3af"
                minLabelPct={MIN_LABEL_PCT}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>H: {goals.for.total.home}</span>
                <span>A: {goals.for.total.away}</span>
              </div>
            </ResultRow>

            <ResultRow
              label="総失点"
              value={goals.against.total.total}
              subtitle={<>平均: {goals.against.average.total}/試合</>}
            >
              <ComparisonBar
                value1={goals.against.total.home}
                value2={goals.against.total.away}
                color1="#dc2626"
                color2="#9ca3af"
                minLabelPct={MIN_LABEL_PCT}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>H: {goals.against.total.home}</span>
                <span>A: {goals.against.total.away}</span>
              </div>
            </ResultRow>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <StatBox label="クリーンシート" value={stats.clean_sheet?.total || 0} />
              <StatBox label="無得点試合" value={stats.failed_to_score?.total || 0} />
            </div>
          </div>
        </StatCard>
      </div>

      {/* ----- 主要フォーメーション ----- */}
      <StatCard title="主要フォーメーション">
        {topFormations.length ? (
          <div className="space-y-3">
            {topFormations.map((f) => (
              <div key={f.formation} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{f.formation}</span>
                  <span className="text-sm">{f.played}試合</span>
                </div>
                <ProgressBar value={f.played} max={total} size="sm" color="#0000cd" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">データなし</p>
        )}
      </StatCard>
    </div>
  );
}
