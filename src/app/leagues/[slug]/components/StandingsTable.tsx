'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Standing } from '@/lib/types/football';

interface StandingsTableProps {
  standings: Standing[][] | null;
  leagueSlug?: string;
  season?: number;
}

// 凡例表示に使用する標準的なラベル
const LEGEND_LABELS = {
  KNOCKOUT: '決勝T進出',
  PLAYOFF: 'プレーオフ進出',
  EL_RELEGATION: 'EL降格',
  ECL_RELEGATION: 'ECL降格',
  ELIMINATION: '敗退',
};

// UEFAの大会スラグ一覧
const UEFA_LEAGUES = ['champions-league', 'europa-league', 'conference-league'];

/**
 * description文字列とリーグに基づき、適切な色とラベルを取得
 */
const getPositionInfo = (
  description?: string,
  leagueSlug?: string,
  rank?: number,
  season?: number
): { color: string; label: string } => {
  // デフォルト値
  const defaultInfo = { color: 'bg-gray-400', label: '' };
  if (!description) return defaultInfo;

  const lcDesc = description.toLowerCase();
  const isUefa = leagueSlug && UEFA_LEAGUES.includes(leagueSlug);
  const isNewFormat = season && season >= 2024;

  // UEFA大会の順位表示
  if (isUefa) {
    // 新フォーマット (2024年以降)
    if (isNewFormat) {
      if (rank && rank <= 8)
        return { color: 'bg-blue-600', label: LEGEND_LABELS.KNOCKOUT };
      if (rank && rank <= 24)
        return { color: 'bg-purple-500', label: LEGEND_LABELS.PLAYOFF };
      return { color: 'bg-gray-400', label: LEGEND_LABELS.ELIMINATION };
    }
    // 旧フォーマット (〜2023年)
    else {
      // 上位2チームは決勝T進出
      if (
        rank === 1 ||
        rank === 2 ||
        lcDesc === 'rank 1' ||
        lcDesc === 'rank 2'
      ) {
        return { color: 'bg-blue-600', label: LEGEND_LABELS.KNOCKOUT };
      }

      // 3位の処理
      if (rank === 3 || lcDesc === 'rank 3') {
        if (leagueSlug === 'champions-league') {
          return { color: 'bg-orange-500', label: LEGEND_LABELS.EL_RELEGATION };
        }
        if (leagueSlug === 'europa-league') {
          return { color: 'bg-green-500', label: LEGEND_LABELS.ECL_RELEGATION };
        }
        return { color: 'bg-gray-400', label: LEGEND_LABELS.ELIMINATION };
      }

      // 4位以下は敗退
      return { color: 'bg-gray-400', label: LEGEND_LABELS.ELIMINATION };
    }
  }

  // 国内リーグの順位表示
  if (
    lcDesc.includes('champions league') &&
    !lcDesc.includes('qualification')
  ) {
    return { color: 'bg-blue-600', label: 'CL' };
  }

  if (lcDesc.includes('europa league') && !lcDesc.includes('qualification')) {
    return { color: 'bg-orange-500', label: 'EL' };
  }

  if (
    lcDesc.includes('conference league') &&
    !lcDesc.includes('qualification')
  ) {
    return { color: 'bg-green-500', label: 'ECL' };
  }

  if (lcDesc.includes('qualification')) {
    if (lcDesc.includes('champions league'))
      return { color: 'bg-blue-400', label: 'CL予選' };
    if (lcDesc.includes('europa league'))
      return { color: 'bg-orange-400', label: 'EL予選' };
    if (lcDesc.includes('conference league'))
      return { color: 'bg-green-400', label: 'ECL予選' };
    return { color: 'bg-purple-400', label: '予選' };
  }

  if (lcDesc.includes('relegation'))
    return { color: 'bg-red-600', label: '降格' };
  if (lcDesc.includes('promotion'))
    return { color: 'bg-teal-500', label: '昇格' };
  if (lcDesc.includes('play-off'))
    return { color: 'bg-purple-500', label: 'PO' };

  return defaultInfo;
};

/**
 * 凡例アイテムを生成
 */
const getLegendItems = (
  standings: Standing[],
  leagueSlug?: string,
  season?: number
): { color: string; label: string }[] => {
  const legendMap = new Map<string, { color: string; label: string }>();
  const isUefa = leagueSlug && UEFA_LEAGUES.includes(leagueSlug);
  const isNewFormat = season && season >= 2024;

  // 実際のデータから凡例を生成
  standings.forEach((standing) => {
    const position = getPositionInfo(
      standing.description,
      leagueSlug,
      standing.rank,
      season
    );
    if (position.label && !legendMap.has(position.label)) {
      legendMap.set(position.label, position);
    }
  });

  // UEFA大会の場合の凡例追加
  if (isUefa) {
    if (isNewFormat) {
      // 新フォーマット: 決勝T進出とプレーオフ進出のみ
      addLegendIfMissing(legendMap, LEGEND_LABELS.KNOCKOUT, 'bg-blue-600');
      addLegendIfMissing(legendMap, LEGEND_LABELS.PLAYOFF, 'bg-purple-500');
      addLegendIfMissing(legendMap, LEGEND_LABELS.ELIMINATION, 'bg-gray-400');

      // 新フォーマットでは「EL降格」「ECL降格」は削除
      legendMap.delete(LEGEND_LABELS.EL_RELEGATION);
      legendMap.delete(LEGEND_LABELS.ECL_RELEGATION);
    } else {
      // 旧フォーマット: 全ての凡例を表示
      addLegendIfMissing(legendMap, LEGEND_LABELS.KNOCKOUT, 'bg-blue-600');

      // 大会に応じた降格先凡例の追加（旧フォーマットのみ）
      if (leagueSlug === 'champions-league') {
        addLegendIfMissing(
          legendMap,
          LEGEND_LABELS.EL_RELEGATION,
          'bg-orange-500'
        );
      } else if (leagueSlug === 'europa-league') {
        addLegendIfMissing(
          legendMap,
          LEGEND_LABELS.ECL_RELEGATION,
          'bg-green-500'
        );
      }

      addLegendIfMissing(legendMap, LEGEND_LABELS.ELIMINATION, 'bg-gray-400');
    }
  }

  return sortLegendItems(legendMap);
};

/**
 * 凡例に項目を追加するヘルパー関数
 */
const addLegendIfMissing = (
  legendMap: Map<string, { color: string; label: string }>,
  label: string,
  color: string
) => {
  if (!legendMap.has(label)) {
    legendMap.set(label, { color, label });
  }
};

/**
 * 凡例アイテムを指定順にソートするヘルパー関数
 */
const sortLegendItems = (
  legendMap: Map<string, { color: string; label: string }>
): { color: string; label: string }[] => {
  // 凡例の表示順序を定義
  const orderedLabels = [
    LEGEND_LABELS.KNOCKOUT,
    LEGEND_LABELS.PLAYOFF,
    LEGEND_LABELS.EL_RELEGATION,
    LEGEND_LABELS.ECL_RELEGATION,
    'CL',
    'EL',
    'ECL',
    'CL予選',
    'EL予選',
    'ECL予選',
    '予選',
    'PO',
    '昇格',
    '降格',
    LEGEND_LABELS.ELIMINATION,
  ];

  const sortedItems: { color: string; label: string }[] = [];

  // 優先順位に従って凡例を追加
  orderedLabels.forEach((label) => {
    if (legendMap.has(label)) {
      sortedItems.push(legendMap.get(label)!);
      legendMap.delete(label);
    }
  });

  // 残りの凡例を追加（予期せぬ項目があった場合）
  sortedItems.push(...Array.from(legendMap.values()));

  return sortedItems;
};

/**
 * 凡例を描画するコンポーネント
 */
const LegendDisplay = ({
  items,
}: {
  items: { color: string; label: string }[];
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4 dark:bg-gray-700 p-3 rounded-md">
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className={`inline-block w-4 h-4 ${item.color} rounded-full border border-gray-300 dark:border-gray-600`}
            ></span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 順位表の共通レンダリング関数
 */
const renderTable = (
  standings: Standing[],
  legendItems: { color: string; label: string }[],
  leagueSlug?: string,
  season?: number,
  showLegend: boolean = true
) => {
  return (
    <div className="overflow-x-auto">
      {showLegend && <LegendDisplay items={legendItems} />}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16"
            >
              順位
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              チーム
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              試合
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              勝
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              分
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              敗
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              得点
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              失点
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              得失点差
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-bold"
            >
              勝点
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {standings.map((standing) => {
            const position = getPositionInfo(
              standing.description,
              leagueSlug,
              standing.rank,
              season
            );

            return (
              <tr
                key={standing.team.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium text-white ${position.color} border border-gray-300 dark:border-gray-600`}
                      title={standing.description || ''}
                    >
                      {standing.rank}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 relative">
                      <Image
                        src={standing.team.logo}
                        alt={standing.team.name}
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                    <div className="ml-3">
                      <Link
                        href={`/teams/${standing.team.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {standing.team.name}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.played}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.win}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.draw}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.lose}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.goals.for}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.all.goals.against}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {standing.goalsDiff > 0
                    ? `+${standing.goalsDiff}`
                    : standing.goalsDiff}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-center">
                  {standing.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * メインコンポーネント: StandingsTable
 */
const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  leagueSlug,
  season = 2024,
}) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        順位表データが見つかりません
      </div>
    );
  }

  // 2023-2024シーズンまでのUEFA大会は複数グループ表示
  const isOldFormatUefa =
    season <= 2023 && leagueSlug && UEFA_LEAGUES.includes(leagueSlug);

  if (isOldFormatUefa && standings.length > 1) {
    // 複数グループを表示
    const allStandings = standings.flat();
    const combinedLegendItems = getLegendItems(
      allStandings,
      leagueSlug,
      season
    );

    return (
      <div>
        {/* 凡例部分 - グループの上に一度だけ表示 */}
        <LegendDisplay items={combinedLegendItems} />

        {/* 複数のグループ表示 */}
        <div className="space-y-8">
          {standings.map((groupStanding, index) => {
            // グループ名を取得
            const groupName =
              groupStanding[0]?.group ||
              `グループ ${String.fromCharCode(65 + index)}`;

            // 凡例アイテムを生成
            const legendItems = getLegendItems(
              groupStanding,
              leagueSlug,
              season
            );

            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                  {groupName}
                </h3>

                {/* 順位表を表示 - 凡例は非表示 */}
                {renderTable(
                  groupStanding,
                  legendItems,
                  leagueSlug,
                  season,
                  false
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    // 単一のグループ/リーグを表示
    const groupStandings = standings[0];
    const legendItems = getLegendItems(groupStandings, leagueSlug, season);

    return renderTable(groupStandings, legendItems, leagueSlug, season, true);
  }
};

export default StandingsTable;
