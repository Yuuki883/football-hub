'use client';

import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

import type { Standing } from '@/lib/types/football';
import { getPositionInfo, getLegendItems } from '@/lib/utils/standings';
import { UEFA_LEAGUES } from '@/lib/constants/standings';
import { Badge } from '@/components/common/Badge';

interface Props {
  standings: Standing[][];
  leagueSlug?: string;
  season?: number;
  isOverview?: boolean; // 概要ページ用の表示フラグ
}

export default function StandingsTable({
  standings,
  leagueSlug,
  season = 2024,
  isOverview = false, // デフォルトは詳細表示
}: Props) {
  if (!standings.length) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-300">
          順位表データがありません
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          選択したシーズン（{season}
          ）のデータが存在しないか、まだ更新されていません
        </p>
      </div>
    );
  }

  const isOldUefa =
    season < 2024 &&
    leagueSlug &&
    UEFA_LEAGUES.includes(
      leagueSlug as 'champions-league' | 'europa-league' | 'conference-league'
    );

  // 旧フォーマット：全グループ合成凡例
  const all = isOldUefa ? standings.flat() : standings[0];
  const legend = getLegendItems(all, leagueSlug, season);

  // 概要ページと詳細ページで表示するヘッダーを変更
  const getHeaders = () => {
    const baseHeaders = ['順位', 'チーム', '試合'];
    const statHeaders = isOverview ? [] : ['勝', '分', '敗'];
    const goalHeaders = ['得点', '失点', '得失差', '勝点'];
    const formHeader = ['直近5試合'];

    return [...baseHeaders, ...statHeaders, ...goalHeaders, ...formHeader];
  };

  // ヘッダーに対応するクラス名を取得する関数
  const getHeaderClass = (header: string) => {
    if (header === '順位') return 'w-16 text-center';
    if (header === 'チーム') return 'text-left';
    if (header === '直近5試合') return 'text-center w-32';
    return 'text-center';
  };

  // データセルに対応するクラス名を取得する関数
  const getCellClass = (header: string) => {
    if (header === '順位') return 'px-3 py-2 text-center w-16';
    if (header === 'チーム') return 'px-3 py-2 text-left';
    if (header === '直近5試合') return 'px-3 py-2 text-center w-32';
    return 'px-3 py-2 text-center';
  };

  // フォームを視覚的に表示するヘルパー関数
  const renderForm = (form: string) => {
    if (!form) return null;

    return (
      <div className="flex justify-center space-x-1">
        {form.split('').map((result, i) => {
          let bgColor = 'bg-gray-200 dark:bg-gray-600';
          let textColor = 'text-gray-800 dark:text-gray-200';

          if (result === 'W') {
            bgColor = 'bg-green-500';
            textColor = 'text-white';
          } else if (result === 'L') {
            bgColor = 'bg-red-500';
            textColor = 'text-white';
          } else if (result === 'D') {
            bgColor = 'bg-yellow-500';
            textColor = 'text-gray-800';
          }

          return (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${bgColor} ${textColor} text-xs font-medium`}
            >
              {result === 'W'
                ? '勝'
                : result === 'L'
                ? '負'
                : result === 'D'
                ? '分'
                : result}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto space-y-6">
      {/* 凡例 */}
      <div className="flex flex-wrap gap-3 mb-4">
        {legend.map((lg, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge color={lg.color}>
              <span className="sr-only">{lg.label}</span>
            </Badge>
            <span className="text-xs">{lg.label}</span>
          </div>
        ))}
      </div>

      {/* 各グループまたは単一グループ */}
      {(isOldUefa ? standings : [standings[0]]).map((group, gi) => (
        <div key={gi} className="bg-white dark:bg-gray-800 rounded-lg p-4">
          {isOldUefa && (
            <h3 className="text-lg font-medium mb-3">
              グループ {String.fromCharCode(65 + gi)}
            </h3>
          )}

          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {getHeaders().map((header) => (
                  <th
                    key={header}
                    className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase ${getHeaderClass(
                      header
                    )}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y">
              {group.map((s) => {
                const pos = getPositionInfo(s, leagueSlug, season);
                const headers = getHeaders();

                return (
                  <tr
                    key={s.team.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className={getCellClass(headers[0])}>
                      <Badge color={pos.color} className="inline-block">
                        {s.rank}
                      </Badge>
                    </td>
                    <td className={getCellClass(headers[1])}>
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={s.team.logo}
                            alt={s.team.name}
                            fill
                            sizes="24px"
                            className="object-contain"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                            }}
                          />
                        </div>
                        <Link href={`/teams/${s.team.id}`} className="text-sm">
                          {s.team.name}
                        </Link>
                      </div>
                    </td>
                    <td className={getCellClass(headers[2])}>{s.all.played}</td>
                    {!isOverview && (
                      <>
                        <td className={getCellClass(headers[3])}>
                          {s.all.win}
                        </td>
                        <td className={getCellClass(headers[4])}>
                          {s.all.draw}
                        </td>
                        <td className={getCellClass(headers[5])}>
                          {s.all.lose}
                        </td>
                      </>
                    )}
                    <td
                      className={getCellClass(
                        isOverview ? headers[3] : headers[6]
                      )}
                    >
                      {s.all.goals.for}
                    </td>
                    <td
                      className={getCellClass(
                        isOverview ? headers[4] : headers[7]
                      )}
                    >
                      {s.all.goals.against}
                    </td>
                    <td
                      className={getCellClass(
                        isOverview ? headers[5] : headers[8]
                      )}
                    >
                      {s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}
                    </td>
                    <td
                      className={`font-bold ${getCellClass(
                        isOverview ? headers[6] : headers[9]
                      )}`}
                    >
                      {s.points}
                    </td>
                    <td
                      className={getCellClass(
                        isOverview ? headers[7] : headers[10]
                      )}
                    >
                      {renderForm(s.form)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
