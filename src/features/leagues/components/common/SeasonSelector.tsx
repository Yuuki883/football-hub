'use client';

/**
 * シーズン選択コンポーネント
 *
 * 概要:
 * - クエリパラメータ `season` を操作して、リーグページの表示シーズンを切替える
 * 主な仕様:
 * - デフォルトシーズンは動的（欧州型7月切替）
 * - 親から `availableSeasons` が渡された場合、それを表示
 * - 渡されない場合は「次シーズン + 現行 + 過去2季」の4件を自動生成
 * 制限事項:
 * - ラベルは "YYYY-YY" 表記（例: 2025-2026）
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_SEASON } from '@/config/api';

interface SeasonSelectorProps {
  /** 現在のシーズン（省略時は動的デフォルト） */
  currentSeason?: number;
  /** 表示可能なシーズン一覧（未開催を除外するために使用） */
  availableSeasons?: number[];
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason, availableSeasons }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const seasonParam = searchParams.get('season');
  const baseSeason = Number(currentSeason ?? DEFAULT_SEASON);

  // プルダウン
  const seasons = useMemo(() => {
    const source =
      Array.isArray(availableSeasons) && availableSeasons.length > 0
        ? [...availableSeasons]
        : [baseSeason + 1, baseSeason, baseSeason - 1, baseSeason - 2];
    // 重複排除 + 降順
    const uniqueSorted = Array.from(new Set(source)).sort((a, b) => b - a);
    return uniqueSorted.map((y) => ({
      id: y,
      name: `${y}-${String((y + 1) % 100).padStart(2, '0')}`,
    }));
  }, [availableSeasons, baseSeason]);

  const initial = seasonParam ?? String(baseSeason);
  const [selectedSeason, setSelectedSeason] = useState<string>(initial);

  const handleSeasonChange = useCallback(
    (season: number) => {
      setSelectedSeason(String(season));
      const params = new URLSearchParams(searchParams.toString());
      params.set('season', String(season));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex justify-end items-center h-full py-2 px-2 sm:px-6">
      <select
        id="season"
        value={selectedSeason}
        onChange={(e) => handleSeasonChange(Number(e.target.value))}
        className="min-w-[130px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-200 text-sm rounded-md 
                   focus:ring-blue-500 focus:border-blue-500 p-1.5 sm:p-2
                   cursor-pointer hover:border-blue-500 dark:hover:border-blue-400
                   transition-colors duration-200"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;
