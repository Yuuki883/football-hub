/**
 * 試合データAPI
 *
 * 統合された試合データ取得機能を提供
 * チーム、リーグ、日付などの様々な条件で試合データを取得できます。
 */

import { fetchFromAPI, createUrl } from '../client/index';
import { withCache, createCacheKey } from '../client/cache';
import { formatMatches, Match, DEFAULT_SEASON, calculateDateRange } from '../utils/data-formatters';
import { CACHE_TTL, LEAGUE_ID_MAPPING } from '@/config/api';

/**
 * 試合データを取得する統合関数
 *
 * 様々なパラメータに基づいて試合データを取得
 *
 * @param params 試合取得パラメータ
 * @returns 試合データの配列
 */
export async function getFixtures({
  teamId,
  leagueId,
  leagueCode,
  dateFrom,
  dateTo,
  season = DEFAULT_SEASON,
  past = true,
  future = true,
  limit = 0,
  forceRefresh = false,
}: {
  teamId?: number | string;
  leagueId?: number | string;
  leagueCode?: string;
  dateFrom?: string;
  dateTo?: string;
  season?: string | number;
  past?: boolean;
  future?: boolean;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<Match[]> {
  // 日付範囲が明示的にundefinedとして渡された場合はスキップ
  // (seasonパラメータだけで全試合を取得する場合)
  const skipDateRange = dateFrom === undefined && dateTo === undefined;

  // 日付範囲が指定されていない場合のみ計算
  if (!skipDateRange && (!dateFrom || !dateTo)) {
    const dateRange = calculateDateRange(past, future);
    if (!dateFrom) dateFrom = dateRange.dateFrom;
    if (!dateTo) dateTo = dateRange.dateTo;
  }

  // キャッシュキーの構築
  const cacheParams: Record<string, any> = {
    team: teamId,
    league: leagueId || leagueCode,
    season,
  };

  // 日付範囲が指定されている場合のみキャッシュキーに含める
  if (dateFrom) cacheParams.from = dateFrom;
  if (dateTo) cacheParams.to = dateTo;

  const cacheKey = createCacheKey('fixtures', cacheParams);
  const cacheTTL = CACHE_TTL.MEDIUM; // 3時間

  return withCache(
    cacheKey,
    async () => {
      // APIリクエストのパラメータを構築
      const params: Record<string, any> = {
        season,
        timezone: 'Asia/Tokyo',
      };

      // 日付範囲が指定されている場合のみ追加
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      if (teamId) params.team = teamId;
      if (leagueId) params.league = leagueId;

      // 'fixtures'エンドポイントを使用
      const url = createUrl('/fixtures', params);
      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return [];
      }

      // 結果をフォーマット
      let matches = formatMatches(data.response);

      // 現在の日付
      const today = new Date();

      // 過去と未来の試合を分離
      if (!past || !future) {
        matches = matches.filter((match) => {
          const matchDate = new Date(match.utcDate);
          if (!past && matchDate < today) return false;
          if (!future && matchDate >= today) return false;
          return true;
        });
      }

      // 日付でソート
      matches.sort((a, b) => {
        const dateA = new Date(a.utcDate);
        const dateB = new Date(b.utcDate);

        // 過去の試合は新しい順（降順）
        if (dateA < today && dateB < today) {
          return dateB.getTime() - dateA.getTime();
        }
        // 未来の試合は近い順（昇順）
        else if (dateA >= today && dateB >= today) {
          return dateA.getTime() - dateB.getTime();
        }
        // 過去と未来が混在する場合は未来を先に
        else {
          return dateA < today ? 1 : -1;
        }
      });

      // 制限が指定されていれば適用（0または負の値の場合は制限なし）
      if (limit > 0) {
        matches = matches.slice(0, limit);
      }

      return matches;
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * 特定リーグの試合データを取得（便利関数）
 *
 * リーグコード（PL, PD, BL1, SA, FL1, CLなど）を指定して試合データを取得
 *
 * @param leagueCode リーグコード
 * @param options 取得オプション
 * @returns 試合データの配列
 */
export async function getMatchesByLeague(
  leagueCode: string,
  options: {
    season?: string | number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`サポートされていないリーグコードです: ${leagueCode}`);
  }

  const { season = DEFAULT_SEASON, limit = 10, forceRefresh = false } = options;

  // 日付範囲が指定されていない場合は今後90日の試合を取得
  let { dateFrom, dateTo } = options;
  if (!dateFrom || !dateTo) {
    const today = new Date();
    const ninetyDaysLater = new Date(today);
    ninetyDaysLater.setDate(today.getDate() + 90);

    dateFrom = dateFrom || today.toISOString().split('T')[0];
    dateTo = dateTo || ninetyDaysLater.toISOString().split('T')[0];
  }

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
 * 特定の日付範囲の試合を取得（便利関数）
 *
 * @param leagueCode リーグコード
 * @param dateFrom 開始日（YYYY-MM-DD形式）
 * @param dateTo 終了日（YYYY-MM-DD形式）
 * @param options 追加オプション
 * @returns 試合データの配列
 */
export async function getMatchesByDateRange(
  leagueCode: string,
  dateFrom: string,
  dateTo: string,
  options: {
    season?: string | number;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`リーグコードが存在しません: ${leagueCode}`);
  }

  const { season = DEFAULT_SEASON, forceRefresh = false } = options;

  return getFixtures({
    leagueId,
    season,
    dateFrom,
    dateTo,
    forceRefresh,
  });
}

/**
 * 指定された日付の全リーグの試合データを一括取得（便利関数）
 *
 * @param date 日付（YYYY-MM-DD形式）
 * @param options 追加オプション
 * @returns 全リーグの試合データの配列（時間順にソート済み）
 */
export async function getAllMatchesByDate(
  date: string,
  options: {
    season?: string | number;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  const { season = DEFAULT_SEASON, forceRefresh = false } = options;

  try {
    // 全リーグのコード一覧
    const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
    let allMatches: Match[] = [];

    // 並列処理で全リーグの試合を取得
    const matchPromises = leagueCodes.map((code) =>
      getMatchesByDateRange(code, date, date, { season, forceRefresh }).catch((error) => {
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
