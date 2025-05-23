// src/components/matches/MatchList.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatMatchDate } from '../utils/match-utils';
import { MatchDisplay } from '../types';
import { groupMatchesByDate, isMatchStarted } from '../utils/match-utils';
import { formatMatchTime } from '@/utils/date-formatter';

type MatchListProps = {
  matches: MatchDisplay[];
};

/**
 * 試合リスト表示コンポーネント
 * 日付ごとにグループ化された試合一覧を表示
 */
export default function MatchList({ matches }: MatchListProps) {
  if (!matches.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">試合予定はありません</p>
      </div>
    );
  }

  // 日付ごとにグループ化
  const matchesByDate = groupMatchesByDate(matches);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Object.entries(matchesByDate).map(([dateKey, dateMatches]: [string, MatchDisplay[]]) => (
        <div key={dateKey} className="w-full">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {formatMatchDate(dateMatches[0].utcDate)}
            </h3>
          </div>
          <div className="w-full">
            {dateMatches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 last:border-0 w-full"
              >
                <div className="flex-1 flex items-center justify-end">
                  <span className="font-semibold mr-3 text-right text-gray-900 dark:text-white text-base sm:text-lg truncate max-w-[120px] sm:max-w-[180px]">
                    {match.homeTeam.shortName || match.homeTeam.name}
                  </span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                    <Image
                      src={match.homeTeam.crest || '/team-placeholder.png'}
                      alt={match.homeTeam.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="w-24 sm:w-28 flex justify-center mx-2 sm:mx-4 flex-shrink-0">
                  {isMatchStarted(match.status) ? (
                    <div className="flex justify-center items-center space-x-2">
                      <span
                        className={`text-base sm:text-xl font-bold ${
                          match.score?.home !== null &&
                          match.score?.away !== null &&
                          (match.score?.home || 0) > (match.score?.away || 0)
                            ? 'text-green-600 dark:text-green-400'
                            : ''
                        }`}
                      >
                        {match.score?.home ?? '0'}
                      </span>
                      <span className="text-sm sm:text-base text-gray-400">-</span>
                      <span
                        className={`text-base sm:text-xl font-bold ${
                          match.score?.home !== null &&
                          match.score?.away !== null &&
                          (match.score?.away || 0) > (match.score?.home || 0)
                            ? 'text-green-600 dark:text-green-400'
                            : ''
                        }`}
                      >
                        {match.score?.away ?? '0'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {formatMatchTime(match.utcDate)}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                    <Image
                      src={match.awayTeam.crest || '/team-placeholder.png'}
                      alt={match.awayTeam.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold ml-3 text-gray-900 dark:text-white text-base sm:text-lg truncate max-w-[120px] sm:max-w-[180px]">
                    {match.awayTeam.shortName || match.awayTeam.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
