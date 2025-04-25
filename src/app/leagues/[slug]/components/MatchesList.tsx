'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Match } from '@/lib/types/football';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MatchesListProps {
  matches: Match[] | null;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        試合データが見つかりません
      </div>
    );
  }

  // 試合の状態を日本語で表示
  const getMatchStatus = (match: Match) => {
    const { status } = match.fixture;

    if (status.short === 'FT') return '試合終了';
    if (status.short === 'NS') {
      // 未開始の場合は開始時間を表示
      const matchDate = new Date(match.fixture.date);
      return format(matchDate, 'HH:mm', { locale: ja });
    }
    if (status.short === '1H') return '前半';
    if (status.short === '2H') return '後半';
    if (status.short === 'HT') return 'ハーフタイム';

    return status.short;
  };

  // 試合日を表示
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'M月d日(E)', { locale: ja });
  };

  // 試合をグループ化（日付ごと）
  const groupedMatches: Record<string, Match[]> = {};

  matches.forEach((match) => {
    const date = match.fixture.date.split('T')[0];
    if (!groupedMatches[date]) {
      groupedMatches[date] = [];
    }
    groupedMatches[date].push(match);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([date, dateMatches]) => (
        <div
          key={date}
          className="rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="bg-gray-100 px-4 py-2 font-medium">
            {formatMatchDate(date)}
          </div>
          <div className="divide-y divide-gray-200">
            {dateMatches.map((match) => (
              <Link
                key={match.fixture.id}
                href={`/matches/${match.fixture.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative h-8 w-8">
                        <Image
                          src={match.teams.home.logo}
                          alt={match.teams.home.name}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none">
                        {match.teams.home.name}
                      </span>
                    </div>

                    <div className="text-center min-w-[80px]">
                      {match.fixture.status.short === 'NS' ? (
                        <span className="text-xs text-gray-500">
                          {getMatchStatus(match)}
                        </span>
                      ) : (
                        <div className="flex justify-center items-center space-x-1">
                          <span
                            className={`text-sm font-bold ${
                              match.teams.home.winner ? 'text-green-600' : ''
                            }`}
                          >
                            {match.goals.home}
                          </span>
                          <span className="text-xs text-gray-400">-</span>
                          <span
                            className={`text-sm font-bold ${
                              match.teams.away.winner ? 'text-green-600' : ''
                            }`}
                          >
                            {match.goals.away}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {match.fixture.status.short !== 'FT' &&
                              getMatchStatus(match)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 flex-1 justify-end text-right">
                      <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none">
                        {match.teams.away.name}
                      </span>
                      <div className="relative h-8 w-8">
                        <Image
                          src={match.teams.away.logo}
                          alt={match.teams.away.name}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchesList;
