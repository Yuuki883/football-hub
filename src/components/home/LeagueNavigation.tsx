'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { League } from '@/lib/types/football';

// スラグとIDのマッピング
const SLUG_MAPPING: Record<number, string> = {
  39: 'premier-league',
  140: 'la-liga',
  78: 'bundesliga',
  135: 'serie-a',
  61: 'ligue-1',
  2: 'champions-league',
  3: 'europa-league',
  848: 'conference-league',
};

// リーグの並び順を定義
const LEAGUE_ORDER = [39, 140, 78, 135, 61, 2, 3, 848];

export default function LeagueNavigation() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // APIからリーグ情報を取得
    const fetchLeagues = async () => {
      try {
        const response = await fetch('/api/leagues');
        if (!response.ok) {
          throw new Error('Failed to fetch leagues');
        }
        const data = await response.json();

        // APIレスポンスからリーグを取得
        const apiLeagues = data.leagues || [];

        // 各リーグIDごとに、APIレスポンスから該当するリーグを見つけるか、
        // 見つからない場合はフォールバックデータを使用
        const orderedLeagues = LEAGUE_ORDER.map((leagueId) => {
          const leagueFromApi = apiLeagues.find(
            (l: League) => l.id === leagueId
          );
          if (leagueFromApi) return leagueFromApi;

          // APIにリーグが見つからない場合はフォールバックから取得
          const fallbackLeague = getFallbackLeagues().find(
            (l) => l.id === leagueId
          );
          return fallbackLeague;
        }).filter(Boolean); // undefinedを除外

        setLeagues(orderedLeagues);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        // エラー時はフォールバックとして静的データを使用
        setLeagues(getFallbackLeagues());
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg animate-pulse"
            >
              <div className="w-14 h-14 mb-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {leagues.map((league) => {
          // リーグIDに対応するスラグを取得
          const slug = SLUG_MAPPING[league.id];
          const href = `/leagues/${slug || league.id}`;

          return (
            <Link
              key={league.id}
              href={href}
              className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-14 h-14 mb-3 flex items-center justify-center">
                <Image
                  src={league.logo || '/league-placeholder.png'}
                  alt={league.name}
                  width={56}
                  height={56}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-center w-full truncate px-1">
                {league.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// フォールバック用のリーグデータ
function getFallbackLeagues(): League[] {
  return [
    {
      id: 39,
      name: 'Premier League',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
    },
    {
      id: 140,
      name: 'La Liga',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
    },
    {
      id: 78,
      name: 'Bundesliga',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
    },
    {
      id: 135,
      name: 'Serie A',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
    },
    {
      id: 61,
      name: 'Ligue 1',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
    },
    {
      id: 2,
      name: 'UEFA Champions League',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
    },
    {
      id: 3,
      name: 'UEFA Europa League',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/3.png',
    },
    {
      id: 848,
      name: 'UEFA Europa Conference League',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/848.png',
    },
  ];
}
