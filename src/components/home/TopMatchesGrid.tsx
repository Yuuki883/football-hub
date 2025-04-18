'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopMatchesGrid() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ダミーデータ
    const dummyMatches = [
      {
        id: 101,
        homeTeam: 'アーセナル',
        awayTeam: 'トッテナム',
        date: '2023-10-25T19:45:00Z',
        competition: 'プレミアリーグ',
      },
      {
        id: 102,
        homeTeam: 'バルセロナ',
        awayTeam: 'レアル・マドリード',
        date: '2023-10-28T19:00:00Z',
        competition: 'ラ・リーガ',
      },
      {
        id: 103,
        homeTeam: 'インテル',
        awayTeam: 'ミラン',
        date: '2023-10-29T20:00:00Z',
        competition: 'セリエA',
      },
      {
        id: 104,
        homeTeam: 'PSG',
        awayTeam: 'マルセイユ',
        date: '2023-10-27T19:00:00Z',
        competition: 'リーグ・アン',
      },
    ];

    setMatches(dummyMatches);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-8">試合情報を読み込み中...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/matches/${match.id}`}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {match.competition}
          </div>
          <div className="flex flex-col items-center">
            <div className="font-medium mb-1">{match.homeTeam}</div>
            <div className="font-medium text-xl my-2">VS</div>
            <div className="font-medium">{match.awayTeam}</div>
          </div>
          <div className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">
            {new Date(match.date).toLocaleDateString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
