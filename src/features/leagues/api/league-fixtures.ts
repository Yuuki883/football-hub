/**
 * リーグ試合データAPI
 *
 * 特定リーグの試合データを取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import { getFixtures } from '@/lib/api-football/api/match-data';
import type { Match } from '@/lib/api-football/utils/data-formatters';
import { getLeagueBySlug } from './league-info';
import { withCache, createCacheKey } from '@/lib/api-football/client/cache';
import { CACHE_TTL } from '@/config/api';

/**
 * リーグの試合を取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param params 取得パラメータ
 * @returns 試合データの配列
 */
export async function getLeagueFixtures(
  leagueIdOrSlug: number | string,
  params: {
    season?: number | string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;

  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    // コード形式（PL, PDなど）の場合はマッピングを使用
    if (LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
      leagueId = LEAGUE_ID_MAPPING[leagueIdOrSlug];
    } else {
      // スラグ形式（premier-league）の場合はスラグからリーグ情報を取得
      const league = await getLeagueBySlug(leagueIdOrSlug);
      if (!league) {
        console.error('リーグが見つかりませんでした:', leagueIdOrSlug);
        return [];
      }
      leagueId = league.league.id;
    }
  }

  const { season = DEFAULT_SEASON, dateFrom, dateTo, limit, forceRefresh = false } = params;

  // 共通機能を使用して試合データを取得
  return getFixtures({
    leagueId,
    season,
    dateFrom,
    dateTo,
    limit,
    forceRefresh,
  });
}

/**
 * リーグの試合を取得
 *
 * getLeagueFixtures のエイリアス関数。後方互換性のために提供。
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param season シーズン
 * @returns 試合データの配列
 */
export async function getLeagueMatches(
  leagueIdOrSlug: number | string,
  season: number | string = DEFAULT_SEASON
): Promise<Match[]> {
  try {
    // 日付や上限の制限なしで全試合データを取得
    return await getLeagueFixtures(leagueIdOrSlug, {
      season,
      forceRefresh: false, // キャッシュを使用
    });
  } catch (error: any) {
    console.error('Error fetching league matches:', error);
    return [];
  }
}

/**
 * 指定された日付の全リーグの試合データを一括取得
 *
 * @param date 日付（YYYY-MM-DD形式）
 * @param params 取得パラメータ
 * @returns 全リーグの試合データの配列
 */
export async function getAllLeagueFixturesByDate(
  date: string,
  params: {
    season?: number | string;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  const { season = DEFAULT_SEASON, forceRefresh = false } = params;

  try {
    // 全リーグのコード一覧
    const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
    let allMatches: Match[] = [];

    // 並列処理で全リーグの試合を取得
    const matchPromises = leagueCodes.map((code) =>
      getLeagueFixtures(code, {
        season,
        dateFrom: date,
        dateTo: date,
        forceRefresh,
      }).catch((error) => {
        console.error(`Error fetching matches for league ${code}:`, error);
        return []; // エラー時は空配列を返してプロセスを継続
      })
    );

    const results = await Promise.all(matchPromises);

    // 結果をマージ
    results.forEach((matches) => {
      if (matches && matches.length > 0) {
        allMatches = [...allMatches, ...matches];
      }
    });

    // 試合開始時間順にソート
    allMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    return allMatches;
  } catch (error) {
    console.error('複数リーグの試合取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * リーグの試合日付を一覧で取得（軽量API呼び出し）
 *
 * @param leagueCode リーグコード
 * @param season シーズン
 * @returns 試合日付の配列 (YYYY-MM-DD形式)
 */
export async function getMatchDatesForLeague(
  leagueCode: string,
  season: string | number = DEFAULT_SEASON
): Promise<string[]> {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`サポートされていないリーグコードです: ${leagueCode}`);
  }

  try {
    // 共通機能を使用して試合データを取得
    const matches = await getLeagueFixtures(leagueId, {
      season,
      // 日付制限なしで全試合を取得（APIの仕様上、現在のシーズンの試合のみ）
    });

    // 日付のみを抽出して重複を排除
    const dateSet = new Set<string>();

    matches.forEach((match) => {
      const matchDate = new Date(match.utcDate);
      const dateString = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      dateSet.add(dateString);
    });

    // Set を配列に変換して日付順にソート
    return Array.from(dateSet).sort();
  } catch (error) {
    console.error(`リーグの試合日程取得中にエラー: ${leagueCode}`, error);
    return [];
  }
}

/**
 * 指定された日付の全リーグの試合データを一括取得
 *
 * @param date 日付（YYYY-MM-DD形式）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 全リーグの試合データの配列（時間順にソート済み）
 */
export async function getAllLeagueMatches(
  date: string,
  forceRefresh: boolean = false,
  season = DEFAULT_SEASON
): Promise<Match[]> {
  // キャッシュキーを作成
  const cacheParams = { date, season };
  const cacheKey = createCacheKey('all-leagues-matches', cacheParams);
  const cacheTTL = CACHE_TTL.MEDIUM; // 3時間

  return withCache(
    cacheKey,
    async () => {
      // getAllLeagueFixturesByDateを使用して実装
      return getAllLeagueFixturesByDate(date, {
        season,
        forceRefresh,
      });
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * 全リーグの試合日程を取得
 *
 * @param season シーズン
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @returns リーグコードをキー、日付配列を値とするオブジェクト
 */
export async function getAllLeagueMatchDates(
  season = DEFAULT_SEASON,
  forceRefresh: boolean = false
): Promise<Record<string, string[]>> {
  // キャッシュキーを作成
  const cacheParams = { season };
  const cacheKey = createCacheKey('all-league-match-dates', cacheParams);
  const cacheTTL = CACHE_TTL.LONG; // 1日

  return withCache(
    cacheKey,
    async () => {
      const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
      const result: Record<string, string[]> = {};

      // 並列に全リーグの日程を取得
      const promises = leagueCodes.map(async (code) => {
        const dates = await getMatchDatesForLeague(code, season);
        result[code] = dates;
      });

      await Promise.all(promises);
      return result;
    },
    cacheTTL,
    forceRefresh
  );
}
