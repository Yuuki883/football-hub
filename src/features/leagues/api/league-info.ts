/**
 * リーグ基本情報API
 *
 * リーグの基本情報を取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { withCache, createCacheKey } from '@/lib/api-football/cache';
import { LEAGUE_ID_MAPPING, LEAGUE_SLUG_MAPPING, CACHE_TTL } from '@/config/api';
import { ApiFootballLeagueData } from '@/lib/api-football/types/league';

/**
 * リーグIDからリーグデータを取得
 *
 * @param id リーグID
 * @returns リーグデータ
 */
export async function getLeagueById(id: number | string): Promise<ApiFootballLeagueData | null> {
  // キャッシュキーを作成
  const cacheParams = { id };
  const cacheKey = createCacheKey('league', cacheParams);
  const cacheTTL = CACHE_TTL.VERY_LONG; // 1週間（リーグ情報は滅多に変わらない）

  return withCache(
    cacheKey,
    async () => {
      const url = createUrl('/leagues', { id });
      const data = await fetchFromAPI(url);
      return data.response[0] || null;
    },
    cacheTTL
  );
}

/**
 * リーグスラグからリーグデータを取得
 * 対象は欧州5大リーグとUEFA主要大会
 *
 * @param slug リーグのスラグ (例: 'premier-league')
 * @returns リーグデータ
 */
export async function getLeagueBySlug(slug: string): Promise<ApiFootballLeagueData | null> {
  // マッピングにあればIDで直接取得
  if (LEAGUE_SLUG_MAPPING[slug]) {
    return getLeagueById(LEAGUE_SLUG_MAPPING[slug]);
  }

  // マッピングになければ該当リーグなし
  console.warn(`No mapping found for slug: "${slug}"`);
  return null;
}

/**
 * 対象の全リーグ情報を取得
 *
 * @returns リーグデータの配列
 */
export async function getAllLeagues(): Promise<ApiFootballLeagueData[]> {
  try {
    // キャッシュキーを作成
    const cacheKey = 'all-leagues';
    const cacheTTL = CACHE_TTL.VERY_LONG; // 1週間

    return withCache(
      cacheKey,
      async () => {
        // 対象リーグのIDリスト（欧州5大リーグとUEFA主要大会）
        const leagueIds = Object.values(LEAGUE_ID_MAPPING);

        // 並列でリーグ情報を取得
        const promises = leagueIds.map((id) => getLeagueById(id));
        const results = await Promise.all(promises);

        // nullを除外して返す
        return results.filter((league): league is ApiFootballLeagueData => league !== null);
      },
      cacheTTL
    );
  } catch (error) {
    console.error('リーグ一覧の取得中にエラーが発生しました:', error);
    return [];
  }
}
