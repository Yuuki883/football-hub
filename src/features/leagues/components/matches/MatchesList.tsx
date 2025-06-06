'use client';

import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import OptimizedImage from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { Match } from '@/lib/api-football/types/type-exports';
import { getStatusText } from '@/features/matches/utils/match-utils';

interface MatchesListProps {
  matches: Match[] | null;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return <div className="p-4 bg-gray-50 rounded-lg text-center">試合データが見つかりません</div>;
  }

  // 試合の状態を日本語で表示
  const getMatchStatus = (match: Match) => {
    const status = getStatusText(String(match.status));
    return status;
  };

  // 試合日を表示
  const formatMatchDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '日付不明';
      }
      return format(date, 'M月d日(E)', { locale: ja });
    } catch (error) {
      console.error('日付フォーマットエラー:', dateString);
      return '日付不明';
    }
  };

  // 試合をグループ化（日付ごと）
  const groupedMatches: Record<string, Match[]> = {};

  matches.forEach((match) => {
    if (!match.utcDate) {
      console.warn('試合データに日付がありません:', match);
      return;
    }

    try {
      const date = match.utcDate.split('T')[0];
      if (!groupedMatches[date]) {
        groupedMatches[date] = [];
      }
      groupedMatches[date].push(match);
    } catch (error) {
      console.error('試合データ処理エラー:', match, error);
    }
  });

  // 日付順にソート
  const sortedDates = Object.keys(groupedMatches).sort();

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dateMatches = groupedMatches[date];

        return (
          <div key={date} className="rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-100 px-4 py-2 font-medium">{formatMatchDate(date)}</div>
            <div className="divide-y divide-gray-200">
              {dateMatches.map((match) => {
                // チーム画像のフォールバック処理
                const homeTeamCrest = match.homeTeam?.crest || '';
                const awayTeamCrest = match.awayTeam?.crest || '';
                const homeTeamName = match.homeTeam?.name || '';
                const awayTeamName = match.awayTeam?.name || '';

                return (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="relative h-8 w-8">
                            <OptimizedImage
                              src={homeTeamCrest}
                              alt={homeTeamName}
                              fill
                              sizes="32px"
                              className="object-contain"
                            />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none">
                            {homeTeamName}
                          </span>
                        </div>

                        <div className="text-center min-w-[80px]">
                          {match.status === 'NS' ? (
                            <span className="text-xs text-gray-500">{getMatchStatus(match)}</span>
                          ) : (
                            <div className="flex justify-center items-center space-x-1">
                              <span
                                className={`text-sm font-bold ${
                                  match.score?.home !== null &&
                                  match.score?.away !== null &&
                                  match.score?.home > match.score?.away
                                    ? 'text-green-600'
                                    : ''
                                }`}
                              >
                                {match.score?.home ?? '-'}
                              </span>
                              <span className="text-xs text-gray-400">-</span>
                              <span
                                className={`text-sm font-bold ${
                                  match.score?.home !== null &&
                                  match.score?.away !== null &&
                                  match.score?.away > match.score?.home
                                    ? 'text-green-600'
                                    : ''
                                }`}
                              >
                                {match.score?.away ?? '-'}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                {match.status !== 'FT' && getMatchStatus(match)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 flex-1 justify-end">
                          <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none text-right">
                            {awayTeamName}
                          </span>
                          <div className="relative h-8 w-8">
                            <OptimizedImage
                              src={awayTeamCrest}
                              alt={awayTeamName}
                              fill
                              sizes="32px"
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MatchesList;
