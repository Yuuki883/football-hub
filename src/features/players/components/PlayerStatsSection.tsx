/**
 * 選手の今シーズンの統計情報セクションコンポーネント
 *
 * ゴール数、アシスト数、出場数などの主要スタッツをカードで表示
 */
import Image from 'next/image';
import { PlayerStats } from '../types/types';

interface PlayerStatsSectionProps {
  stats: PlayerStats;
}

export default function PlayerStatsSection({ stats }: PlayerStatsSectionProps) {
  // データがすべて未設定の場合のチェック - 出場時間とゴールとアシストのいずれかがあれば表示
  const hasNoStats =
    !stats.appearances && !stats.minutes && !stats.goals && !stats.assists && !stats.rating;

  // リーグとシーズン表示用のフォーマット
  const formatSeason = (season?: string) => {
    if (!season) return '';
    // シーズンがYYYYの形式なら、YYYY-YYYY+1に変換
    if (season.length === 4) {
      const startYear = parseInt(season);
      return `${startYear}-${startYear + 1}`;
    }
    return season;
  };

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
    // 評価（rating）を最初に表示
    {
      label: '評価',
      value: stats.rating ? parseFloat(stats.rating) : 0,
      isRating: true,
      icon: (
        <svg
          className="w-6 h-6 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
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
      <div className="flex items-center mb-6">
        {stats.league ? (
          <>
            {/* リーグのロゴとリーグ名、シーズン */}
            <div className="flex items-center">
              {stats.league.logo && (
                <div className="relative h-8 w-8 mr-3">
                  <Image
                    src={stats.league.logo}
                    alt={stats.league.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  {stats.league.name} {stats.league.season && formatSeason(stats.league.season)}
                </h2>
                <p className="text-sm text-slate-500">今シーズンの成績</p>
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-xl font-bold text-slate-800">今シーズンの成績</h2>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <StatCard
            key={`stat-${index}`}
            label={item.label}
            value={item.value}
            unit={item.unit}
            icon={item.icon}
            isRating={item.isRating}
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
  isRating?: boolean;
}

function StatCard({ label, value, unit, icon, isRating }: StatCardProps) {
  return (
    <div className={`rounded-lg p-4 flex items-center`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">
          {isRating ? value.toFixed(1) : value}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
