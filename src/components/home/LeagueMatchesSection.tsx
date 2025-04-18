// src/components/home/LeagueMatchesSection.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MatchList from '@/components/matches/MatchList';
import Link from 'next/link';

// リーグデータ
const leagues = [
  { id: 'PL', name: 'プレミアリーグ' },
  { id: 'PD', name: 'ラ・リーガ' },
  { id: 'BL1', name: 'ブンデスリーガ' },
  { id: 'SA', name: 'セリエA' },
  { id: 'FL1', name: 'リーグ・アン' },
  { id: 'CL', name: 'チャンピオンズリーグ' },
];

// マッチデータの型
interface Match {
  id: string;
  utcDate: string;
  status: string;
  homeTeam: {
    name: string;
    shortName?: string;
    crest?: string;
  };
  awayTeam: {
    name: string;
    shortName?: string;
    crest?: string;
  };
  score: {
    home: number | null;
    away: number | null;
  };
}

export default function LeagueMatchesSection() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]);

  // 暫定的なデータ
  const dummyData: Match[] = [];

  const { data: matches, isLoading } = useQuery({
    queryKey: ['leagueMatches', selectedLeague.id],
    queryFn: async () => {
      // ダミーデータ
      console.log(
        `リーグ ${selectedLeague.name} の試合データをリクエスト中...`
      );
      // 実際のAPIが準備できたらこちらを使用
      /*
      const response = await fetch(`/api/matches/featured?league=${selectedLeague.id}`);
      if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
      }
      return response.json();
      */
      return dummyData;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          リーグ別試合
        </h2>
        <div className="relative">
          <select
            value={selectedLeague.id}
            onChange={(e) => {
              const league = leagues.find((l) => l.id === e.target.value);
              if (league) setSelectedLeague(league);
            }}
            className="appearance-none block w-full px-4 py-2 pr-8 bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shadow">
        {isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3 last:mb-0"
              ></div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              試合データは準備中です
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/leagues/${selectedLeague.id.toLowerCase()}`}
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {selectedLeague.name}のすべての試合を見る
        </Link>
      </div>
    </div>
  );
}
