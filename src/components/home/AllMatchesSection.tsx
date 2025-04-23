'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import SmartMatchCalendar from '@/components/matches/SmartMatchCalendar';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

// 試合オブジェクトの型定義
interface Match {
  id: string;
  utcDate: string;
  status: string;
  competition: {
    id: string;
    code: string;
    name: string;
    emblem: string;
  };
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  score?: {
    home: number | null;
    away: number | null;
  };
}

// リーグ情報の型定義
interface LeagueData {
  id: string;
  code: string;
  name: string;
  emblem: string;
  matches: Match[];
}

/**
 * 日付別全リーグ試合表示コンポーネント
 *
 * 機能:
 * 1. 日付選択による全リーグの試合表示
 * 2. リーグごとのグループ化と表示
 * 3. 試合状況に応じた表示（予定・進行中・終了）
 */
export default function AllMatchesSection() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 日付選択の状態管理
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // デフォルトは現在の日付
    return new Date();
  });

  // 日付のフォーマット（APIリクエスト用）
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  /**
   * 試合データ取得
   */
  const {
    data: matches,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dayMatches', dateStr],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/matches?date=${dateStr}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json() as Promise<Match[]>;
      } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30分
    refetchOnWindowFocus: false,
  });

  // 日付選択ハンドラ
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 手動データ更新ボタンのハンドラ
  const handleRefresh = useCallback(async () => {
    try {
      // forceRefreshパラメータを追加して直接フェッチ
      const response = await fetch(
        `/api/matches?date=${dateStr}&forceRefresh=true`
      );

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      const data = await response.json();

      // React Queryのキャッシュを更新
      queryClient.setQueryData(['dayMatches', dateStr], data);
    } catch (error) {
      console.error('強制更新中にエラーが発生しました:', error);
    }
  }, [dateStr, queryClient]);

  // リーグごとに試合をグループ化
  const matchesByLeague = useMemo(() => {
    if (!matches || matches.length === 0) return {};

    const result: Record<string, LeagueData> = {};

    matches.forEach((match: Match) => {
      const leagueId = match.competition.id;
      const leagueCode = match.competition.code;

      if (!result[leagueId]) {
        result[leagueId] = {
          id: leagueId,
          code: leagueCode,
          name: match.competition.name,
          emblem: match.competition.emblem,
          matches: [],
        };
      }

      result[leagueId].matches.push(match);
    });

    // 各リーグ内で試合開始時間でソート
    Object.values(result).forEach((league) => {
      league.matches.sort(
        (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
      );
    });

    return result;
  }, [matches]);

  return (
    <div>
      {/* ヘッダー部分: タイトルのみ表示 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            試合一覧
          </h2>
        </div>
      </div>

      {/* 日付カレンダー */}
      <SmartMatchCalendar
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        selectedLeague="PL" // デフォルトリーグ（APIで全リーグをサポートする場合は不要）
      />

      {/* メインコンテンツ部分: 試合リスト表示 */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden shadow">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"></div>

        {isLoading ? (
          <MatchesSkeleton />
        ) : isError ? (
          <ErrorDisplay error={error} onRetry={handleRefresh} />
        ) : !matches || matches.length === 0 ? (
          <EmptyMatchesDisplay date={selectedDate} />
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* リーグごとの表示 */}
            <div className="px-2 py-1 sm:px-4 sm:py-2 space-y-4">
              {Object.values(matchesByLeague).map((league) => (
                <LeagueMatchesCard
                  key={league.id}
                  league={league}
                  isExpanded={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// リーグごとの試合カード
interface LeagueMatchesCardProps {
  league: LeagueData;
  isExpanded: boolean;
}

function LeagueMatchesCard({ league }: LeagueMatchesCardProps) {
  // 試合のステータス概要（進行中/終了/予定の試合数）
  const statusSummary = useMemo(() => {
    const liveCount = league.matches.filter(
      (m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'
    ).length;

    const finishedCount = league.matches.filter(
      (m) => m.status === 'FINISHED'
    ).length;

    return { liveCount, finishedCount, totalCount: league.matches.length };
  }, [league.matches]);

  // 常に展開表示
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 text-left font-medium">
        <div className="flex items-center flex-wrap flex-1 mr-2">
          <div className="w-8 h-8 mr-3 relative flex-shrink-0 flex items-center justify-center">
            <Image
              src={league.emblem || '/league-placeholder.png'}
              alt={league.name}
              width={28}
              height={28}
              className="object-contain max-w-full max-h-full"
            />
          </div>
          <span className="font-medium mr-2">{league.name}</span>
          <div className="flex items-center space-x-1 mt-0.5">
            {statusSummary.liveCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Live {statusSummary.liveCount}
              </span>
            )}
            <span className="text-sm text-gray-500">
              ({league.matches.length}試合)
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {league.matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 試合行
function MatchRow({ match }: { match: Match }) {
  // 試合時間表示の生成
  const getMatchTimeDisplay = () => {
    switch (match.status) {
      case 'FINISHED':
        return 'FT';
      case 'IN_PLAY':
        return 'LIVE';
      case 'PAUSED':
        return 'HT';
      case 'SCHEDULED':
      default:
        return format(new Date(match.utcDate), 'HH:mm');
    }
  };

  // スコア表示用のテキスト
  const getScoreDisplay = () => {
    // 試合終了またはLIVE中の場合は実際のスコアを表示
    if (
      match.status === 'FINISHED' ||
      match.status === 'IN_PLAY' ||
      match.status === 'PAUSED'
    ) {
      return `${match.score?.home ?? '0'}-${match.score?.away ?? '0'}`;
    }
    // 予定試合の場合はVSを表示
    return 'VS';
  };

  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <div className="text-sm text-gray-600 dark:text-gray-400 w-16 text-center flex-shrink-0">
        {getMatchTimeDisplay()}
      </div>

      <div className="flex-1 flex items-center justify-end mr-2">
        <span className="font-medium mr-2 text-right text-gray-900 dark:text-white truncate max-w-[120px]">
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <div className="w-7 h-7 relative flex-shrink-0 flex items-center justify-center">
          <Image
            src={match.homeTeam.crest || '/team-placeholder.png'}
            alt={match.homeTeam.name}
            width={24}
            height={24}
            className="object-contain max-w-full max-h-full"
          />
        </div>
      </div>

      <div className="w-16 flex justify-center flex-shrink-0">
        {match.status === 'FINISHED' ? (
          <div className="text-center font-bold text-lg px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {match.score?.home ?? '-'}-{match.score?.away ?? '-'}
          </div>
        ) : match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
          <div className="text-center font-bold text-lg px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded animate-pulse">
            {match.score?.home ?? '0'}-{match.score?.away ?? '0'}
          </div>
        ) : (
          <div className="text-xs px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {match.score
              ? `${match.score.home ?? '0'}-${match.score.away ?? '0'}`
              : 'VS'}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center ml-2">
        <div className="w-7 h-7 relative flex-shrink-0 flex items-center justify-center">
          <Image
            src={match.awayTeam.crest || '/team-placeholder.png'}
            alt={match.awayTeam.name}
            width={24}
            height={24}
            className="object-contain max-w-full max-h-full"
          />
        </div>
        <span className="font-medium ml-2 text-gray-900 dark:text-white truncate max-w-[120px]">
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
      </div>

      <div className="w-10 flex justify-center flex-shrink-0">
        {match.status === 'IN_PLAY' && (
          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
            LIVE
          </span>
        )}
      </div>
    </Link>
  );
}

// ローディング中のスケルトン表示
function MatchesSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {/* リーグセクションスケルトン */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-10 rounded mb-3" />
          {/* 試合行スケルトン */}
          {[...Array(3)].map((_, j) => (
            <div
              key={j}
              className="bg-gray-200 dark:bg-gray-700 h-16 rounded mb-2"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// エラー表示コンポーネント
function ErrorDisplay({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 max-w-md">
        <p className="text-red-700 dark:text-red-400 mb-2">
          データの取得中にエラーが発生しました
        </p>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          {error instanceof Error ? error.message : '不明なエラー'}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

// 試合がない場合の表示
function EmptyMatchesDisplay({ date }: { date: Date }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
        {format(date, 'yyyy年M月d日(E)', { locale: ja })}の試合はありません
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        別の日付を選択してください
      </p>
    </div>
  );
}
