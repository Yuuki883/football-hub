/**
 * 試合ヘッダーコンポーネント
 * 試合の基本情報（チーム、スコア、ステータス、日時）を表示
 */

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Fixture } from '../types/match.types';
import { getStatusText, getStatusClass, formatMatchDate } from '../utils/match-utils';

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
      <div className="p-4 bg-gray-50 border-b flex items-center justify-center">
        {safeFixture.league.logo && (
          <Image
            src={safeFixture.league.logo}
            alt={safeFixture.league.name}
            width={32}
            height={32}
            className="mr-2"
          />
        )}
        <span className="text-lg font-semibold">
          {safeFixture.league.name} {formattedRound}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* ホームチーム */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <Image
                src={safeFixture.teams.home.logo}
                alt={safeFixture.teams.home.name}
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <h2 className="mt-3 text-lg font-bold text-center">{safeFixture.teams.home.name}</h2>
          </div>

          {/* スコア */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-2">{score}</div>
            <span
              className={`px-3 py-1 text-white text-sm font-medium rounded-full mb-2 ${statusInfo.className}`}
            >
              {statusInfo.text}
              {isLive && safeFixture.status.elapsed && ` (${safeFixture.status.elapsed}分)`}
            </span>
            <div className="text-sm text-gray-500">{formattedDate}</div>
            {safeFixture.venue.name && (
              <div className="mt-1 text-xs text-gray-500">
                {safeFixture.venue.name}, {safeFixture.venue.city}
              </div>
            )}
          </div>

          {/* アウェイチーム */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <Image
                src={safeFixture.teams.away.logo}
                alt={safeFixture.teams.away.name}
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <h2 className="mt-3 text-lg font-bold text-center">{safeFixture.teams.away.name}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
