import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MatchDisplay } from '../types/match.types';
import { isMatchStarted } from '../utils/match-utils';
import { formatMatchTime } from '@/utils/date-formatter';

interface MatchItemProps {
  match: MatchDisplay;
}

/**
 * 個別試合表示コンポーネント
 * 一覧内で試合情報を表示する
 */
const MatchItem: React.FC<MatchItemProps> = ({ match }) => {
  // 試合が開始済みかどうか
  const matchStarted = isMatchStarted(match.status);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <div className="flex-1 flex items-center justify-end">
        <span className="font-semibold mr-3 text-right text-gray-900 dark:text-white text-base sm:text-lg truncate max-w-[120px] sm:max-w-[180px]">
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
          <Image
            src={match.homeTeam.crest || '/team-placeholder.png'}
            alt={match.homeTeam.name}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      </div>

      <div className="w-24 sm:w-28 flex justify-center mx-2 sm:mx-4">
        {matchStarted ? (
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
        <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
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
  );
};

export default MatchItem;
