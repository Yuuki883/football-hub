'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import { useEffect, useState } from 'react';
import { FormattedLeague } from '@/lib/api-football/types/league';
import { LEAGUE_SLUG_MAPPING } from '@/config/api';

// リーグの並び順を定義
const LEAGUE_ORDER = [39, 140, 78, 135, 61, 2, 3, 848];

export default function LeagueNavigation() {
  const [leagues, setLeagues] = useState<FormattedLeague[]>([]);

  useEffect(() => {
    // APIからリーグ情報を取得
    const fetchLeagues = async () => {
      try {
        // 既存のAPIエンドポイントを使用
        const response = await fetch('/api/leagues');
        if (!response.ok) {
          throw new Error('Failed to fetch leagues');
        }
        const data = await response.json();

        if (!data.success || !data.leagues) {
          throw new Error('Invalid response format');
        }

        // 取得したリーグを指定した順序に並べ替え
        const orderedLeagues = LEAGUE_ORDER.map((leagueId) =>
          data.leagues.find((l: FormattedLeague) => l.id === leagueId)
        ).filter(Boolean);

        setLeagues(orderedLeagues);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {leagues.map((league) => {
          // リーグIDからスラグを取得
          const slug =
            Object.entries(LEAGUE_SLUG_MAPPING).find(([_, id]) => Number(id) === league.id)?.[0] ||
            league.id.toString();
          const href = `/leagues/${slug}`;

          return (
            <Link
              key={league.id}
              href={href}
              className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-14 h-14 mb-3 flex items-center justify-center">
                <OptimizedImage
                  src={league.logo || ''}
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
