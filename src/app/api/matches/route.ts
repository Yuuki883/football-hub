import { NextResponse } from 'next/server';
import {
  getMatchesByDateRange,
  getMatchDatesForLeague,
  getAllLeagueMatches,
  getAllLeagueMatchDates,
} from '@/lib/services/match-data-service';
import { cacheGet, cacheSet } from '@/lib/redis';
import { format, parseISO, isBefore, isAfter, isToday } from 'date-fns';

/**
 * 日付指定で全リーグの試合を取得するAPI
 *
 * 機能:
 * - 指定された日付の全リーグ試合情報を一括取得
 * - API-FootballのAPIからデータを取得
 * - Redisによる日付ベースのキャッシュ機能あり（暫定）
 * - 過去の試合: 1週間キャッシュ
 * - 当日の試合: 30分キャッシュ
 * --未来の試合: 1日キャッシュ
 *
 * クエリパラメータ:
 * - date: 日付（YYYY-MM-DD形式）、デフォルトは当日
 * - forceRefresh: 'true'の場合、キャッシュを無視して最新データを取得
 * - datesOnly: 'true'の場合、試合が存在する日付のみを返す
 * - leagueCode: (オプション) 特定リーグのみ取得する場合に指定
 *
 * レスポンス:
 * - 200: 試合データの配列またはdatesOnlyの場合は日付配列
 * - 500: エラー発生時
 */

// 日付に応じたキャッシュTTLを決定する関数
function determineCacheTTL(dateStr: string): number {
  const date = parseISO(dateStr);
  const now = new Date();

  if (isBefore(date, now) && !isToday(date)) {
    return 7 * 24 * 60 * 60; // 過去の試合: 1週間
  } else if (isAfter(date, now) && !isToday(date)) {
    return 24 * 60 * 60; // 将来の試合: 1日
  } else {
    return 30 * 60; // 当日の試合: 30分
  }
}

// キャッシュキーを生成する関数
function generateCacheKey(
  type: 'matches' | 'dates',
  date: string,
  leagueCode?: string
): string {
  const dateStr = format(parseISO(date), 'yyyy-MM-dd');

  if (type === 'dates') {
    return `match-dates:${leagueCode || 'all'}:${dateStr}`;
  }

  return leagueCode
    ? `matches:${leagueCode}:${dateStr}`
    : `matches:all-leagues:${dateStr}`;
}

// キャッシュからデータを取得するか、API呼び出しを行う関数
async function getFromCacheOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number,
  forceRefresh: boolean = false
): Promise<T> {
  // キャッシュチェック (forceRefreshがtrueの場合はスキップ)
  if (!forceRefresh) {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // データ取得
  const data = await fetchFn();

  // キャッシュ保存
  await cacheSet(cacheKey, data, ttl);

  return data;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // パラメータの取得
  const today = new Date().toISOString().split('T')[0];
  const date = url.searchParams.get('date') || today;
  const leagueCode = url.searchParams.get('leagueCode');
  const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
  const datesOnly = url.searchParams.get('datesOnly') === 'true';

  try {
    // 日付のみのリクエストの場合
    if (datesOnly) {
      if (leagueCode) {
        // 特定リーグの場合
        const cacheKey = generateCacheKey('dates', date, leagueCode);

        const dates = await getFromCacheOrFetch(
          cacheKey,
          () => getMatchDatesForLeague(leagueCode),
          24 * 60 * 60, // 日付のみのデータは1日キャッシュ
          forceRefresh
        );

        return NextResponse.json(dates);
      } else {
        // 全リーグの場合は全リーグの日付データを取得
        const cacheKey = `all-leagues-dates:${date}`;

        const allDates = await getFromCacheOrFetch(
          cacheKey,
          async () => {
            // 全リーグの日付データを取得
            const allLeagueDates = await getAllLeagueMatchDates();

            // 全リーグのデータを一つのフラットな配列に変換
            const uniqueDates = new Set<string>();
            Object.values(allLeagueDates).forEach((dates) => {
              dates.forEach((date) => uniqueDates.add(date));
            });

            // 日付順にソート
            return Array.from(uniqueDates).sort();
          },
          24 * 60 * 60, // 日付データは1日キャッシュ
          forceRefresh
        );

        return NextResponse.json(allDates);
      }
    }

    // 特定リーグのみ取得するか全リーグ取得か分岐
    if (leagueCode) {
      // キャッシュキー生成
      const cacheKey = generateCacheKey('matches', date, leagueCode);
      const ttl = determineCacheTTL(date);

      // 特定リーグの試合を取得
      const matches = await getFromCacheOrFetch(
        cacheKey,
        () => getMatchesByDateRange(leagueCode, date, date, forceRefresh),
        ttl,
        forceRefresh
      );

      return NextResponse.json(matches);
    } else {
      // 全リーグの試合を取得する
      const matches = await getAllLeagueMatches(date, forceRefresh);
      return NextResponse.json(matches);
    }
  } catch (error) {
    console.error(`Failed to fetch matches for date ${date}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch matches',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
