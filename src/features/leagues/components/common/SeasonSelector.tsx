'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface SeasonSelectorProps {
  currentSeason?: number;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason = 2024 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const season = searchParams.get('season');

  // 内部の選択状態を管理
  const [selectedSeason, setSelectedSeason] = useState(season || 2024);

  // currentSeasonが変更されたときに内部の状態も更新
  // useEffect(() => {
  //   setSelectedSeason(currentSeason);
  // }, [currentSeason]);

  // 利用可能なシーズンリスト（最新から過去3シーズンまで）
  const seasons = [
    { id: 2024, name: '2024-2025' },
    { id: 2023, name: '2023-2024' },
    { id: 2022, name: '2022-2023' },
  ];

  // シーズン変更ハンドラー
  const handleSeasonChange = useCallback(
    (season: number) => {
      setSelectedSeason(season);

      const params = new URLSearchParams(searchParams.toString());
      params.set('season', season.toString());

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex justify-end items-center h-full py-2 px-2 sm:px-6">
      <label
        htmlFor="season"
        className="text-sm text-gray-600 dark:text-gray-300 mr-2 hidden sm:inline-block"
      ></label>
      <select
        id="season"
        value={selectedSeason}
        onChange={(e) => handleSeasonChange(Number(e.target.value))}
        className="min-w-[110px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                  text-gray-700 dark:text-gray-200 text-sm rounded-md 
                  focus:ring-blue-500 focus:border-blue-500 p-1.5 sm:p-2
                  cursor-pointer hover:border-blue-500 dark:hover:border-blue-400
                  transition-colors duration-200"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;
