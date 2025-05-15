// src/components/home/LiveMatchesCarousel.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 試合データの型定義
interface MatchData {
  id: string;
  minute: string;
  competition: {
    name: string;
    emblem: string;
  };
  homeTeam: {
    name: string;
    crest: string;
  };
  awayTeam: {
    name: string;
    crest: string;
  };
  score: {
    home: number;
    away: number;
  };
}

export default function LiveMatchesCarousel() {
  const [liveMatches, setLiveMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveMatches() {
      try {
        // クライアントサイドで静的なデータを使用する
        const dummyMatches: MatchData[] = [
          {
            id: '12345',
            minute: '45',
            competition: {
              name: 'プレミアリーグ',
              emblem: '/premier-league.svg',
            },
            homeTeam: {
              name: 'アーセナル',
              crest: '/teams/arsenal.svg',
            },
            awayTeam: {
              name: 'チェルシー',
              crest: '/teams/chelsea.svg',
            },
            score: {
              home: 2,
              away: 1,
            },
          },
          {
            id: '67890',
            minute: '67',
            competition: {
              name: 'ラ・リーガ',
              emblem: '/la-liga.svg',
            },
            homeTeam: {
              name: 'バルセロナ',
              crest: '/teams/barcelona.svg',
            },
            awayTeam: {
              name: 'レアル・マドリード',
              crest: '/teams/real-madrid.svg',
            },
            score: {
              home: 1,
              away: 1,
            },
          },
        ];

        // 本番環境では以下のようにAPIから取得する
        // const response = await fetch('/api/live-scores');
        // const data = await response.json();
        // setLiveMatches(data);

        setLiveMatches(dummyMatches);
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-600 py-4 dark:bg-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              ライブマッチ
            </h2>
          </div>
          <div className="overflow-hidden">
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[300px] h-32 bg-white/10 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <div className="bg-blue-600 py-4 dark:bg-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">今日の試合</h2>
            <Link
              href="/matches/live"
              className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-2"
            >
              すべての試合を見る
            </Link>
          </div>
          <p className="text-white/80 text-center py-8">現在ライブで行われている試合はありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 py-4 dark:bg-blue-800 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            ライブマッチ
          </h2>
          <Link
            href="/matches/live"
            className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-2"
          >
            すべて見る
          </Link>
        </div>

        <div className="relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-1 text-white"
            aria-label="前へ"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 py-2">
              {liveMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="min-w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <Image
                        src={match.competition.emblem || '/placeholder.png'}
                        alt={match.competition.name}
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <span className="text-xs font-medium">{match.competition.name}</span>
                    </div>
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                      {match.minute}′
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 relative">
                          <Image
                            src={match.homeTeam.crest || '/team-placeholder.png'}
                            alt={match.homeTeam.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="ml-3 font-medium">{match.homeTeam.name}</span>
                      </div>
                      <span className="font-bold text-xl">{match.score.home}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 relative">
                          <Image
                            src={match.awayTeam.crest || '/team-placeholder.png'}
                            alt={match.awayTeam.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="ml-3 font-medium">{match.awayTeam.name}</span>
                      </div>
                      <span className="font-bold text-xl">{match.score.away}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-1 text-white"
            aria-label="次へ"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
