/**
 * リーグ基本情報API
 *
 * リーグの基本情報を取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { fetchFromAPI, createUrl } from '@/lib/api-football/total-exports';
import { withCache, createCacheKey } from '@/lib/api-football/client/cache';
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
 * 対象は欧州5大リーグとUEFA主要大会（複数パターン対応）
 *
 * @param slug リーグのスラグ (例: 'premier-league', 'champions-league')
 * @returns リーグデータ
 */
export async function getLeagueBySlug(slug: string): Promise<ApiFootballLeagueData | null> {
  // デバッグ用ログ（緊急対応）
  console.log(`🔍 リーグ検索開始: slug="${slug}"`);

  // マッピングにあればIDで直接取得
  if (LEAGUE_SLUG_MAPPING[slug]) {
    const leagueId = LEAGUE_SLUG_MAPPING[slug];
    console.log(`✅ マッピング発見: slug="${slug}" → ID=${leagueId}`);
    return getLeagueById(leagueId);
  }

  // マッピングになければ該当リーグなし
  console.warn(`❌ マッピングが見つかりません: slug="${slug}"`);
  console.log(`📋 利用可能なslugリスト:`, Object.keys(LEAGUE_SLUG_MAPPING));
  return null;
}

/**
 * リーグIDから標準的なスラッグを取得
 * UEFA大会の場合は短縮形（champions-league）を優先して返す
 *
 * @param leagueId リーグID
 * @returns 標準的なリーグスラッグ（見つからない場合はnull）
 */
export function getStandardLeagueSlugById(leagueId: number | string): string | null {
  const id = typeof leagueId === 'string' ? parseInt(leagueId) : leagueId;

  // UEFA大会の標準slug定義
  const UEFA_STANDARD_SLUGS: Record<number, string> = {
    2: 'champions-league',
    3: 'europa-league',
    848: 'conference-league',
  };

  // UEFA大会の場合は標準slugを返す
  if (UEFA_STANDARD_SLUGS[id]) {
    return UEFA_STANDARD_SLUGS[id];
  }

  // その他のリーグの場合はマッピングから最初に見つかったものを返す
  for (const [slug, mappedId] of Object.entries(LEAGUE_SLUG_MAPPING)) {
    if (mappedId === id) {
      return slug;
    }
  }

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
