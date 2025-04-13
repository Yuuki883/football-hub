'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  competition: string;
}

export default function LiveScoreboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // ここにAPIからライブマッチデータを取得するロジックを実装
      // 仮のデータ
      const mockMatches: Match[] = [
        {
          id: '1',
          homeTeam: 'マンチェスター・シティ',
          awayTeam: 'リバプール',
          homeScore: 2,
          awayScore: 1,
          minute: 75,
          competition: 'プレミアリーグ',
        },
        {
          id: '2',
          homeTeam: 'レアル・マドリード',
          awayTeam: 'バルセロナ',
          homeScore: 1,
          awayScore: 1,
          minute: 60,
          competition: 'ラ・リーガ',
        },
      ];

      setMatches(mockMatches);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('ライブマッチデータの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ライブスコア
        </h3>
        <button
          onClick={fetchMatches}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="更新"
        >
          <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          現在ライブの試合はありません
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {matches.map((match) => (
            <div
              key={match.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {match.competition}
                </span>
                <span className="text-xs font-medium text-red-500">
                  {match.minute}分
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {match.homeTeam}
                  </p>
                </div>
                <div className="px-4 font-bold text-lg">
                  {match.homeScore} - {match.awayScore}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {match.awayTeam}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastUpdated && (
        <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
          最終更新:{' '}
          {formatDistanceToNow(lastUpdated, { locale: ja, addSuffix: true })}
        </div>
      )}
    </div>
  );
}
