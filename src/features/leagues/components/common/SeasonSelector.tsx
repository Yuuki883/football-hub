'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { generateSeasonOptions, getCurrentSeason } from '@/utils/season-utils';

/**
 * シーズンセレクターのプロパティ
 */
interface SeasonSelectorProps {
  /** 現在のシーズン（オプション）。指定されない場合は動的に取得される */
  currentSeason?: number;
}

/**
 * シーズンセレクターコンポーネント
 *
 * ユーザーがシーズンを選択できるUI
 * 現在のシーズンとそれ以前の3シーズンを選択肢として表示
 *
 * 機能:
 * - 動的なシーズンリスト生成
 * - URLパラメータとの連携
 * - シーズン変更時の自動ページ遷移
 *
 * @param {SeasonSelectorProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} シーズンセレクターUI
 */
const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason = getCurrentSeason() }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const season = searchParams.get('season');

  // 内部の選択状態を管理
  // URLパラメータが存在する場合はそれを使用、なければ現在のシーズンを使用
  const [selectedSeason, setSelectedSeason] = useState(season || getCurrentSeason());

  /**
   * URLパラメータが変更された時に内部状態を同期
   */
  useEffect(() => {
    if (season) {
      setSelectedSeason(season);
    }
  }, [season]);

  /**
   * 利用可能なシーズンリスト
   *
   * 動的に生成されるため、シーズンが変わっても自動的に最新のリストが表示される
   */
  const seasons = generateSeasonOptions(false, 3);

  /**
   * シーズン変更ハンドラー
   *
   * ユーザーがシーズンを選択したときに呼ばれます。
   * 選択されたシーズンをURLパラメータに反映し、ページを再読み込みします。
   *
   * @param {number} season - 選択されたシーズン
   */
  const handleSeasonChange = useCallback(
    (season: number) => {
      // 内部状態を更新
      setSelectedSeason(season);

      // URLパラメータを更新
      const params = new URLSearchParams(searchParams.toString());
      params.set('season', season.toString());

      // 新しいURLにナビゲート
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
