/**
 * 試合データAPI
 *
 * 統合された試合データ取得機能を提供
 * チーム、リーグ、日付などの様々な条件で試合データを取得できます。
 */

import { fetchFromAPI, createUrl } from './index';
import { withCache, createCacheKey } from './cache';
import { formatMatches, Match, DEFAULT_SEASON, calculateDateRange } from './fixtures';
import { CACHE_TTL } from '@/config/api';

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
  // 日付範囲が指定されていない場合は計算
  if (!dateFrom || !dateTo) {
    const dateRange = calculateDateRange(past, future);
    if (!dateFrom) dateFrom = dateRange.dateFrom;
    if (!dateTo) dateTo = dateRange.dateTo;
  }

  // キャッシュキーの構築
  const cacheParams: Record<string, any> = {
    team: teamId,
    league: leagueId || leagueCode,
    season,
    from: dateFrom,
    to: dateTo,
  };

  const cacheKey = createCacheKey('fixtures', cacheParams);
  const cacheTTL = CACHE_TTL.MEDIUM; // 3時間

  return withCache(
    cacheKey,
    async () => {
      // APIリクエストのパラメータを構築
      const params: Record<string, any> = {
        season,
        from: dateFrom,
        to: dateTo,
        timezone: 'Asia/Tokyo',
      };

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
