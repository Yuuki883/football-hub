/**
 * チーム基本情報API
 *
 * チームの基本情報を取得する機能を提供
 * lib/api-footballの共通機能を使用。
 */

import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { withCache, createCacheKey } from '@/lib/api-football/cache';
import { CACHE_TTL } from '@/config/api';

/**
 * チームの基本情報を取得する
 *
 * @param teamId チームID
 * @param forceRefresh キャッシュを無視して強制更新する場合はtrue
 * @returns チーム情報
 */
export async function getTeamById(
  teamId: number | string,
  forceRefresh: boolean = false
) {
  if (!teamId) {
    throw new Error('チームIDが指定されていません');
  }

  // キャッシュキーを作成
  const cacheParams = { id: teamId };
  const cacheKey = createCacheKey('team', cacheParams);
  const cacheTTL = CACHE_TTL.LONG; // 24時間（チーム情報は頻繁に変わらない）

  return withCache(
    cacheKey,
    async () => {
      const url = createUrl('/teams', { id: teamId });
      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return null;
      }

      return data.response[0];
    },
    cacheTTL,
    forceRefresh
  );
}
