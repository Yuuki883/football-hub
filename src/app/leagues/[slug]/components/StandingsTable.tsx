'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Standing } from '@/lib/types/football';

interface StandingsTableProps {
  standings: Standing[][] | null;
  leagueSlug?: string;
  season?: number;
}

/**
 * description文字列から適切な色とラベルを取得
 */
const getPositionInfo = (
  description?: string,
  leagueSlug?: string
): { color: string; label: string } => {
  if (!description) return { color: 'bg-gray-200', label: '' };

  // 文字列を小文字に変換して検索しやすくする
  const lcDesc = description.toLowerCase();

  // チャンピオンズリーグ
  if (
    lcDesc.includes('champions league group stage') ||
    (lcDesc.includes('champions league') && !lcDesc.includes('qualification'))
  ) {
    return { color: 'bg-blue-600', label: 'CL' };
  }

  // ヨーロッパリーグ
  if (
    lcDesc.includes('europa league group stage') ||
    (lcDesc.includes('europa league') && !lcDesc.includes('qualification'))
  ) {
    return { color: 'bg-orange-500', label: 'EL' };
  }

  // カンファレンスリーグ
  if (
    lcDesc.includes('conference league') &&
    !lcDesc.includes('qualification')
  ) {
    return { color: 'bg-green-500', label: 'ECL' };
  }

  // 予選関連
  if (lcDesc.includes('qualification')) {
    if (lcDesc.includes('champions league')) {
      return { color: 'bg-blue-400', label: 'CL予選' };
    }
    if (lcDesc.includes('europa league')) {
      return { color: 'bg-orange-400', label: 'EL予選' };
    }
    if (lcDesc.includes('conference league')) {
      return { color: 'bg-green-400', label: 'ECL予選' };
    }
    return { color: 'bg-purple-400', label: '予選' };
  }

  // 降格関連
  if (lcDesc.includes('relegation')) {
    return { color: 'bg-red-600', label: '降格' };
  }

  // 昇格関連
  if (lcDesc.includes('promotion')) {
    return { color: 'bg-teal-500', label: '昇格' };
  }

  // プレーオフ関連
  if (lcDesc.includes('play-off')) {
    return { color: 'bg-purple-500', label: 'PO' };
  }

  // UEFA大会特殊ケース
  if (
    leagueSlug === 'champions-league' ||
    leagueSlug === 'europa-league' ||
    leagueSlug === 'conference-league'
  ) {
    if (lcDesc.includes('knockout') || lcDesc.includes('final')) {
      return { color: 'bg-blue-600', label: '決勝T' };
    }
    if (lcDesc.includes('elimination')) {
      return { color: 'bg-red-600', label: '敗退' };
    }
  }

  return { color: 'bg-gray-200', label: '' };
};

/**
 * リーグタイプに応じた凡例アイテムを生成
 */
const getLegendItems = (
  standings: Standing[],
  leagueSlug?: string,
  season?: number
): { color: string; label: string }[] => {
  // UEFA大会の場合
  if (
    leagueSlug === 'champions-league' ||
    leagueSlug === 'europa-league' ||
    leagueSlug === 'conference-league'
  ) {
    if (season && season <= 2023) {
      // 2023-2024シーズンまでのグループステージ制
      const items = [
        { color: 'bg-blue-600', label: '決勝トーナメント進出' },
        { color: 'bg-red-600', label: '敗退' },
      ];

      // チャンピオンズリーグは3位がELに降格
      if (leagueSlug === 'champions-league') {
        items.splice(1, 0, {
          color: 'bg-orange-500',
          label: 'ヨーロッパリーグ降格',
        });
      }

      // ヨーロッパリーグは3位がECLに降格
      if (leagueSlug === 'europa-league') {
        items.splice(1, 0, {
          color: 'bg-green-500',
          label: 'カンファレンスリーグ降格',
        });
      }

      return items;
    } else {
      // 2024-2025シーズン以降のリーグフェーズ制
      const items = [
        { color: 'bg-blue-600', label: '決勝トーナメント進出' },
        { color: 'bg-red-600', label: '敗退' },
      ];

      // CLは9-24位がノックアウトプレーオフに進出、25位以下が敗退
      if (leagueSlug === 'champions-league') {
        items.splice(1, 0, {
          color: 'bg-purple-500',
          label: 'ノックアウトプレーオフ',
        });
      }

      // ELは9-24位がノックアウトプレーオフに進出、25位以下が敗退
      if (leagueSlug === 'europa-league') {
        items.splice(1, 0, {
          color: 'bg-purple-500',
          label: 'ノックアウトプレーオフ',
        });
      }

      return items;
    }
  }

  // 欧州５大リーグの場合はAPIから取得したdescriptionを使用
  const descriptions = standings
    .filter((standing) => standing.description)
    .map((standing) => standing.description || '');

  const legendMap = new Map<string, { color: string; label: string }>();

  descriptions.forEach((desc) => {
    if (!desc) return;

    const info = getPositionInfo(desc, leagueSlug);
    if (info.color !== 'bg-gray-200') {
      // 凡例ラベルを決定
      let label = '';
      switch (info.color) {
        case 'bg-blue-600':
          label = 'チャンピオンズリーグ';
          break;
        case 'bg-orange-500':
          label = 'ヨーロッパリーグ';
          break;
        case 'bg-green-500':
          label = 'カンファレンスリーグ';
          break;
        case 'bg-blue-400':
          label = 'チャンピオンズリーグ予選';
          break;
        case 'bg-orange-400':
          label = 'ヨーロッパリーグ予選';
          break;
        case 'bg-green-400':
          label = 'カンファレンスリーグ予選';
          break;
        case 'bg-red-600':
          label = '降格';
          break;
        case 'bg-teal-500':
          label = '昇格';
          break;
        case 'bg-purple-500':
          label = 'プレーオフ';
          break;
        case 'bg-purple-400':
          label = '予選';
          break;
        default:
          label = desc; // デフォルトでは説明文そのものを使用
      }

      // 色をキーにして重複を防ぐ
      legendMap.set(info.color, { color: info.color, label });
    }
  });

  return Array.from(legendMap.values());
};

const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  leagueSlug,
  season = 2024,
}) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        順位表データが見つかりません
      </div>
    );
  }

  // 2023-2024シーズンまでのUEFA大会は複数グループ表示
  const isOldFormatUefa =
    season <= 2023 &&
    (leagueSlug === 'champions-league' ||
      leagueSlug === 'europa-league' ||
      leagueSlug === 'conference-league');

  if (isOldFormatUefa && standings.length > 1) {
    // 複数グループを表示
    return (
      <div className="space-y-8">
        {standings.map((groupStanding, index) => {
          // グループ名を取得（APIから提供される場合はそれを使用）
          const groupName =
            groupStanding[0]?.group ||
            `グループ ${String.fromCharCode(65 + index)}`;

          // 凡例アイテムを生成
          const legendItems = getLegendItems(groupStanding, leagueSlug, season);

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{groupName}</h3>
              {renderTable(groupStanding, legendItems, leagueSlug)}
            </div>
          );
        })}
      </div>
    );
  } else {
    // 単一のグループ/リーグを表示（国内リーグや2024-2025以降のUEFA大会）
    const groupStandings = standings[0];
    const legendItems = getLegendItems(groupStandings, leagueSlug, season);

    return renderTable(groupStandings, legendItems, leagueSlug);
  }
};

/**
 * 順位表の共通レンダリング関数
 */
const renderTable = (
  standings: Standing[],
  legendItems: { color: string; label: string }[],
  leagueSlug?: string
) => {
  return (
    <div className="overflow-x-auto">
      {legendItems.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 ${item.color} rounded-full`}
              ></span>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
            >
              順位
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              チーム
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              試合
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              勝
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              分
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              敗
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              得点
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              失点
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              得失点差
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-bold"
            >
              勝点
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((standing) => {
            const position = getPositionInfo(standing.description, leagueSlug);

            return (
              <tr
                key={standing.team.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium text-white ${position.color}`}
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
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {standing.team.name}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.played}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.win}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.draw}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.lose}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.goals.for}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.all.goals.against}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {standing.goalsDiff > 0
                    ? `+${standing.goalsDiff}`
                    : standing.goalsDiff}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-center">
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

export default StandingsTable;
