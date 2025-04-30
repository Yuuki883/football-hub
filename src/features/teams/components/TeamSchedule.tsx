'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Match } from '@/lib/types/football';

interface TeamScheduleProps {
  pastFixtures: Match[];
  futureFixtures: Match[];
  isLoading: boolean;
}

export default function TeamSchedule({
  pastFixtures,
  futureFixtures,
  isLoading,
}: TeamScheduleProps) {
  // 日付をフォーマットする関数
  const formatMatchDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'yyyy年M月d日(E)', { locale: ja });
  };

  // 時刻をフォーマットする関数
  const formatMatchTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  };

  // 試合のステータスを取得する関数
  const getMatchStatus = (match: Match) => {
    switch (match.fixture.status.short) {
      case 'FT':
        return '試合終了';
      case 'HT':
        return 'ハーフタイム';
      case '1H':
        return '前半';
      case '2H':
        return '後半';
      case 'NS':
        return formatMatchTime(match.fixture.date);
      default:
        return match.fixture.status.short;
    }
  };

  // 試合リストを表示する関数
  const renderFixturesList = (fixtures: Match[], title: string) => {
    if (fixtures.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          {title}はありません
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="space-y-2">
          {fixtures.map((match) => (
            <Link
              key={match.fixture.id}
              href={`/matches/${match.fixture.id}`}
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {formatMatchDate(match.fixture.date)}
                </div>
                <div className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                  {match.league.name}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {/* ホームチーム */}
                <div className="flex items-center space-x-2 flex-1">
                  <div className="relative w-6 h-6">
                    <Image
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      fill
                      sizes="24px"
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={`font-medium ${
                      match.teams.home.winner ? 'text-green-600' : ''
                    }`}
                  >
                    {match.teams.home.name}
                  </span>
                </div>

                {/* スコア・ステータス */}
                <div className="flex flex-col items-center mx-3">
                  {match.fixture.status.short === 'NS' ? (
                    <div className="text-xs text-gray-500">
                      {getMatchStatus(match)}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">{match.goals.home}</span>
                      <span className="text-gray-400">-</span>
                      <span className="font-bold">{match.goals.away}</span>
                    </div>
                  )}
                  {match.fixture.status.short !== 'NS' &&
                    match.fixture.status.short !== 'FT' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {getMatchStatus(match)}
                      </div>
                    )}
                </div>

                {/* アウェイチーム */}
                <div className="flex items-center space-x-2 flex-1 justify-end">
                  <span
                    className={`font-medium ${
                      match.teams.away.winner ? 'text-green-600' : ''
                    }`}
                  >
                    {match.teams.away.name}
                  </span>
                  <div className="relative w-6 h-6">
                    <Image
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      fill
                      sizes="24px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {renderFixturesList(futureFixtures, '今後の試合')}
      {renderFixturesList(pastFixtures, '直近の試合')}
    </div>
  );
}
