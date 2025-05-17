import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Match } from '@/types/match';
import { formatMatchTime } from '@/utils/date-formatter';

interface MatchItemProps {
  match: Match;
}

const MatchItem: React.FC<MatchItemProps> = ({ match }) => {
  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <div className="text-sm text-gray-600 dark:text-gray-400 w-16 text-center">
        {formatMatchTime(match.utcDate)}
      </div>

      <div className="flex-1 flex items-center justify-end mr-4">
        <span className="font-medium mr-3 text-right text-gray-900 dark:text-white">
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <div className="w-6 h-6 relative">
          <Image
            src={match.homeTeam.crest || '/team-placeholder.png'}
            alt={match.homeTeam.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      </div>

      <div className="w-10 flex justify-center">
        {match.status === 'FINISHED' ? (
          <div className="text-center font-semibold">
            {match.score.home}-{match.score.away}
          </div>
        ) : (
          <div className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            VS
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center ml-4">
        <div className="w-6 h-6 relative">
          <Image
            src={match.awayTeam.crest || '/team-placeholder.png'}
            alt={match.awayTeam.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <span className="font-medium ml-3 text-gray-900 dark:text-white">
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
      </div>
    </Link>
  );
};

export default MatchItem;
