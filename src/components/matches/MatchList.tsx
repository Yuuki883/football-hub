// src/components/matches/MatchList.tsx
import Image from 'next/image';
import Link from 'next/link';
import { formatMatchTime, formatMatchDate } from '@/utils/date-formatter';

type MatchListProps = {
  matches: any[];
};

export default function MatchList({ matches }: MatchListProps) {
  if (!matches.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">試合予定はありません</p>
      </div>
    );
  }

  // 日付ごとにグループ化
  const matchesByDate = matches.reduce((acc: Record<string, any[]>, match) => {
    const dateKey = formatMatchDate(match.utcDate, 'group');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {});

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Object.entries(matchesByDate).map(([dateKey, dateMatches]: [string, any[]]) => (
        <div key={dateKey}>
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatMatchDate(dateMatches[0].utcDate, 'display')}
            </h3>
          </div>
          <div>
            {dateMatches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 last:border-0"
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
