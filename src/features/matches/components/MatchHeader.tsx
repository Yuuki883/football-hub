/**
 * 試合ヘッダーコンポーネント
 * 試合の基本情報（チーム、スコア、ステータス、日時）を表示
 */

'use client';

import { useMemo } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { Fixture } from '../types';
import { getStatusText, getStatusClass } from '../utils/match-utils';
import { formatMatchDate } from '@/lib/api-football/utils/data-formatters';

interface MatchHeaderProps {
  fixture: Fixture;
}

/**
 * ラウンド情報をフォーマットする
 * 例: "Regular Season - 37" → "37節"
 */
function formatRound(round: string): string {
  if (!round) return '';

  // "Regular Season - 37" のようなフォーマットから数字部分を抽出
  const match = round.match(/(\d+)$/);
  if (match && match[1]) {
    return `${match[1]}節`;
  }

  return round;
}

/**
 * 試合ヘッダーコンポーネント
 * @param fixture - 試合情報
 * @returns 試合ヘッダーUI
 */
export function MatchHeader({ fixture }: MatchHeaderProps) {
  // 安全にデータを扱うためのデータ検証とデフォルト値の設定
  const safeFixture = useMemo(() => {
    return {
      date: fixture?.date || '',
      status: {
        long: fixture?.status?.long || 'Not Started',
        short: fixture?.status?.short || '',
        elapsed: fixture?.status?.elapsed || null,
      },
      league: {
        name: fixture?.league?.name || '',
        round: fixture?.league?.round || '',
        logo: fixture?.league?.logo || '',
      },
      teams: {
        home: {
          name: fixture?.teams?.home?.name || 'ホームチーム',
          logo: fixture?.teams?.home?.logo || '',
        },
        away: {
          name: fixture?.teams?.away?.name || 'アウェイチーム',
          logo: fixture?.teams?.away?.logo || '',
        },
      },
      goals: {
        home: fixture?.goals?.home ?? '-',
        away: fixture?.goals?.away ?? '-',
      },
      venue: {
        name: fixture?.venue?.name || '',
        city: fixture?.venue?.city || '',
      },
    };
  }, [fixture]);

  // 日付とステータス情報をメモ化
  const formattedDate = useMemo(() => {
    try {
      return formatMatchDate(safeFixture.date);
    } catch (error) {
      console.error('日付フォーマットエラー:', error);
      return '日付情報なし';
    }
  }, [safeFixture.date]);

  const statusInfo = useMemo(() => {
    try {
      const text = getStatusText(safeFixture.status.long);
      const className = getStatusClass(safeFixture.status.long);
      return { text, className };
    } catch (error) {
      console.error('ステータス処理エラー:', error);
      return { text: '情報なし', className: 'bg-gray-600' };
    }
  }, [safeFixture.status.long]);

  // ラウンド情報をフォーマット
  const formattedRound = useMemo(() => {
    return formatRound(safeFixture.league.round);
  }, [safeFixture.league.round]);

  const isLive = safeFixture.status.short === 'LIVE';
  const score = `${safeFixture.goals.home} - ${safeFixture.goals.away}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* リーグ情報 */}
      <div className="p-3 sm:p-4 bg-gray-50 border-b flex items-center justify-center">
        {safeFixture.league.logo && (
          <OptimizedImage
            src={safeFixture.league.logo}
            alt={safeFixture.league.name}
            width={24}
            height={24}
            className="mr-2 sm:w-8 sm:h-8"
          />
        )}
        <span className="text-base sm:text-lg font-semibold">
          {safeFixture.league.name} {formattedRound}
        </span>
      </div>

      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          {/* ホームチーム */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <Link
              href={`/teams/${fixture.teams.home.id}`}
              className="flex flex-col items-center hover:opacity-90 transition-opacity"
            >
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-2 sm:mb-3 flex-shrink-0 transition-transform hover:scale-105">
                <OptimizedImage
                  src={safeFixture.teams.home.logo}
                  alt={safeFixture.teams.home.name}
                  fill
                  sizes="(max-width: 640px) 56px, 80px"
                  className="object-contain"
                />
              </div>
              <span className="text-base sm:text-xl md:text-2xl font-extrabold truncate text-center hover:underline max-w-[120px] sm:max-w-full">
                {safeFixture.teams.home.name}
              </span>
            </Link>
          </div>

          {/* スコア */}
          <div className="flex flex-col items-center flex-shrink-0 mx-2 sm:mx-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{score}</div>
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 text-white text-xs sm:text-sm font-medium rounded-full mb-1 sm:mb-2 ${statusInfo.className}`}
            >
              {statusInfo.text}
              {isLive && safeFixture.status.elapsed && ` (${safeFixture.status.elapsed}分)`}
            </span>
            <div className="text-xs sm:text-sm text-gray-500">{formattedDate}</div>
            {safeFixture.venue.name && (
              <div className="mt-1 text-[10px] sm:text-xs text-gray-500 text-center max-w-[150px] sm:max-w-full">
                {safeFixture.venue.name}, {safeFixture.venue.city}
              </div>
            )}
          </div>

          {/* アウェイチーム*/}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <Link
              href={`/teams/${fixture.teams.away.id}`}
              className="flex flex-col items-center hover:opacity-90 transition-opacity"
            >
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-2 sm:mb-3 flex-shrink-0 transition-transform hover:scale-105">
                <OptimizedImage
                  src={safeFixture.teams.away.logo}
                  alt={safeFixture.teams.away.name}
                  fill
                  sizes="(max-width: 640px) 56px, 80px"
                  className="object-contain"
                />
              </div>
              <span className="text-base sm:text-xl md:text-2xl font-extrabold truncate text-center hover:underline max-w-[120px] sm:max-w-full">
                {safeFixture.teams.away.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
