/**
 * 試合スタッツパネル
 * 試合の詳細統計情報を表示するコンポーネント
 */

'use client';

import { useState, useEffect } from 'react';
import { Fixture } from '../types/match.types';
import { getStatistics } from '../api/match-service';
import { STAT_LABELS, STAT_CATEGORIES, CATEGORY_COLORS } from '../constants/matches';

interface StatsPanelProps {
  fixture: Fixture;
}

/**
 * 統計項目コンポーネント
 * 2チームの統計情報を視覚的に比較表示
 */
function StatItem({
  label,
  home,
  away,
}: {
  label: string;
  home: number | string | null;
  away: number | string | null;
}) {
  // null値を0に変換
  const homeValue = home === null ? 0 : home;
  const awayValue = away === null ? 0 : away;

  // パーセンテージ値またはそのまま数値を計算
  const getPercentage = () => {
    // パス成功率やボール支配率のように、パーセント値そのものを表す場合
    // 例: "Passes %" = "87%" と "90%" の場合
    if (
      typeof homeValue === 'string' &&
      typeof awayValue === 'string' &&
      (homeValue.includes('%') || awayValue.includes('%'))
    ) {
      // パーセント値のケース：実際の値を直接比較して表示（相対値ではない）
      const homePercent = parseInt(homeValue.replace('%', ''), 10);
      const awayPercent = parseInt(awayValue.replace('%', ''), 10);

      if (!isNaN(homePercent) && !isNaN(awayPercent)) {
        // パーセント値は0-100の範囲で直接表示
        return homePercent;
      }
      return 50;
    }

    // 数値型の場合は相対的な比率を計算
    if (typeof homeValue === 'number' && typeof awayValue === 'number') {
      const total = homeValue + awayValue;
      if (total === 0) return 50; // 0で割ることを防ぐ
      return Math.round((homeValue / total) * 100);
    }

    // デフォルト値（同等）
    return 50;
  };

  // ボール支配率やパーセント系の統計項目の場合、特別な処理
  const isPercentageStat =
    (typeof homeValue === 'string' && homeValue.includes('%')) ||
    label === 'ボール支配率' ||
    label === 'パス成功率';

  const homePercentage = getPercentage();
  const awayPercentage = isPercentageStat
    ? typeof awayValue === 'string'
      ? parseInt(awayValue.replace('%', ''), 10)
      : 0
    : 100 - homePercentage;

  // バーの表示方法（パーセント系とそれ以外で分ける）
  const renderBar = () => {
    if (isPercentageStat) {
      // パーセント値はそのままの値を使用（最大100%）
      return (
        <div className="flex w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{ width: `${homePercentage}%` }}
          ></div>
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-600"
            style={{ width: `${awayPercentage}%` }}
          ></div>
        </div>
      );
    } else {
      // 相対値を使用（合計100%になるようにバランス）
      return (
        <div className="flex h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full"
            style={{ width: `${homePercentage}%` }}
          ></div>
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 h-full"
            style={{ width: `${awayPercentage}%` }}
          ></div>
        </div>
      );
    }
  };

  // 値の表示フォーマット
  const formatValue = (value: number | string | null) => {
    if (value === null) return '0';
    return value;
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <div className="font-medium text-right w-16 text-blue-600">{formatValue(homeValue)}</div>
        <div className="text-xs font-medium text-gray-600 text-center">{label}</div>
        <div className="font-medium text-left w-16 text-red-500">{formatValue(awayValue)}</div>
      </div>
      <div className="flex-1">{renderBar()}</div>
    </div>
  );
}

/**
 * 試合スタッツパネルコンポーネント
 * @param fixture - 試合情報
 * @returns スタッツパネルUI
 */
export default function StatsPanel({ fixture }: StatsPanelProps) {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 統計データを取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await getStatistics(fixture.id.toString());
        setStatistics(statsData);
      } catch (err) {
        console.error('統計データ取得エラー:', err);
        setError('統計データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [fixture.id]);

  // チーム別の統計データを取得
  const homeStats = statistics?.find((s) => s.team.id === fixture.teams.home.id)?.statistics || [];
  const awayStats = statistics?.find((s) => s.team.id === fixture.teams.away.id)?.statistics || [];

  // 統計項目を取得
  const getStatValue = (type: string) => {
    const homeStat = homeStats.find((s: any) => s.type === type)?.value;
    const awayStat = awayStats.find((s: any) => s.type === type)?.value;
    return { home: homeStat, away: awayStat };
  };

  // 利用可能な全統計タイプを取得（防いだゴール数を除く）
  const getAllStatTypes = () => {
    const types = new Set<string>();
    if (homeStats && homeStats.length > 0) {
      homeStats.forEach((stat: any) => {
        if (stat.type && stat.type !== 'goals_prevented') types.add(stat.type);
      });
    }
    return Array.from(types);
  };

  const allStatTypes = getAllStatTypes();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      {/* 統計カードグリッド */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* 2列グリッドで統計カードを表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 統計情報（カテゴリ別） */}
          {Object.entries(STAT_CATEGORIES).map(([category, statTypes]) => (
            <div
              key={category}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
            >
              <div className="mb-4">
                <h4
                  className={`text-md font-semibold text-center py-2 bg-gradient-to-r from-${category === 'ボール支配' ? 'blue' : category === 'シュート' ? 'green' : category === 'セットプレー' ? 'purple' : category === 'ファウル&カード' ? 'yellow' : category === 'GK' ? 'indigo' : category === 'ゴール期待値' ? 'pink' : 'gray'}-50 to-${category === 'ボール支配' ? 'blue' : category === 'シュート' ? 'green' : category === 'セットプレー' ? 'purple' : category === 'ファウル&カード' ? 'yellow' : category === 'GK' ? 'indigo' : category === 'ゴール期待値' ? 'pink' : 'gray'}-100`}
                >
                  {category}
                </h4>
              </div>
              <div className="space-y-4 p-4">
                {statTypes.map((statType) => {
                  const { home, away } = getStatValue(statType);
                  const label = STAT_LABELS[statType] || statType;
                  return <StatItem key={statType} label={label} home={home} away={away} />;
                })}
              </div>
            </div>
          ))}

          {/* カテゴリ化されていないその他の統計情報 */}
          {allStatTypes.filter(
            (type) =>
              !Object.values(STAT_CATEGORIES).flat().includes(type) && type !== 'goals_prevented'
          ).length > 0 && (
            <div
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${CATEGORY_COLORS['その他']}`}
            >
              <div className="mb-4">
                <h4 className="text-md font-semibold text-center py-2 bg-gradient-to-r from-gray-50 to-gray-100">
                  その他
                </h4>
              </div>
              <div className="space-y-4 p-4">
                {allStatTypes
                  .filter(
                    (type) =>
                      !Object.values(STAT_CATEGORIES).flat().includes(type) &&
                      type !== 'goals_prevented'
                  )
                  .map((statType) => {
                    const { home, away } = getStatValue(statType);
                    const label = STAT_LABELS[statType] || statType;
                    return <StatItem key={statType} label={label} home={home} away={away} />;
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
