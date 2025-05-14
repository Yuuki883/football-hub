/**
 * 選手の今シーズンの統計情報セクションコンポーネント
 *
 * ゴール数、アシスト数、出場数などの主要スタッツをカードで表示
 */
import { PlayerStats } from '../types/types';

interface PlayerStatsSectionProps {
  stats: PlayerStats;
}

export default function PlayerStatsSection({ stats }: PlayerStatsSectionProps) {
  // データがすべて未設定の場合のチェック
  const hasNoStats =
    !stats.appearances &&
    !stats.minutes &&
    !stats.goals &&
    !stats.assists &&
    !stats.yellowCards &&
    !stats.redCards;

  // 統計データがない場合
  if (hasNoStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">今シーズンの成績</h2>
        <p className="text-slate-500 italic">今シーズンの統計データはまだありません</p>
      </div>
    );
  }

  // 統計データ項目の定義
  const statItems = [
    {
      label: 'ゴール',
      value: stats.goals ?? 0,
      icon: (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
        </svg>
      ),
    },
    {
      label: 'アシスト',
      value: stats.assists ?? 0,
      icon: (
        <svg
          className="w-6 h-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
          />
        </svg>
      ),
    },
    {
      label: '出場',
      value: stats.appearances ?? 0,
      unit: '試合',
      icon: (
        <svg
          className="w-6 h-6 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: '出場時間',
      value: stats.minutes ?? 0,
      unit: '分',
      icon: (
        <svg
          className="w-6 h-6 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: 'イエローカード',
      value: stats.yellowCards ?? 0,
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <rect width="16" height="20" x="4" y="2" rx="2" />
        </svg>
      ),
    },
    {
      label: 'レッドカード',
      value: stats.redCards ?? 0,
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <rect width="16" height="20" x="4" y="2" rx="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6">今シーズンの成績</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <StatCard
            key={`stat-${index}`}
            label={item.label}
            value={item.value}
            unit={item.unit}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

// 統計カードコンポーネント
interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 flex items-center">
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">
          {value}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
