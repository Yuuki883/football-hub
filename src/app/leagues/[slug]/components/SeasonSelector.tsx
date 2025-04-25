'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface SeasonSelectorProps {
  currentSeason?: number;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  currentSeason = 2024,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 内部の選択状態を管理
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);

  // currentSeasonが変更されたときに内部の状態も更新
  useEffect(() => {
    setSelectedSeason(currentSeason);
  }, [currentSeason]);

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
    <div className="flex items-center h-full py-2">
      <select
        id="season"
        value={selectedSeason}
        onChange={(e) => handleSeasonChange(Number(e.target.value))}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md 
                  focus:ring-blue-500 focus:border-blue-500 p-2"
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
