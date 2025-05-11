/**
 * API-Football APIデータキャッシュ機能
 *
 * Redisを使用したキャッシュ機能を提供
 * データを取得する際に、キャッシュを優先して使用し、必要に応じてAPIから取得
 */

import { getRedisClient } from '@/lib/redis';

/**
 * キャッシュ付きでデータを取得する共通関数
 *
 * @param cacheKey キャッシュキー
 * @param fetchFunction データ取得関数
 * @param ttl キャッシュ有効時間（秒）
 * @param forceRefresh キャッシュを無視して強制更新する場合はtrue
 * @returns 取得したデータ
 */
export async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 3600, // デフォルト1時間
  forceRefresh: boolean = false
): Promise<T> {
  try {
    const redis = await getRedisClient();

    // 強制リフレッシュが指定されていない場合、Redisからキャッシュを取得
    if (!forceRefresh && redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
          console.error(`キャッシュデータのパースエラー: ${cacheKey}`, parseError);
          // パースエラー時は通常のフェッチを続行
        }
      }
    }

    // キャッシュに無い場合または強制リフレッシュ時はデータを取得
    const data = await fetchFunction();

    // 取得したデータをキャッシュに保存
    if (redis && data) {
      try {
        await redis.set(cacheKey, JSON.stringify(data), {
          EX: ttl,
        });
      } catch (cacheError) {
        console.error(`キャッシュ保存エラー: ${cacheKey}`, cacheError);
        // キャッシュエラー時もデータは返す
      }
    }

    return data;
  } catch (error) {
    console.error(`キャッシュ操作エラー: ${cacheKey}`, error);
    // キャッシュ操作が失敗しても、実際のデータ取得は試みる
    return fetchFunction();
  }
}

/**
 * キャッシュキーの生成ヘルパー
 *
 * @param prefix キープレフィックス
 * @param params キャッシュパラメータ
 * @returns フォーマット済みキャッシュキー
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`)
    .join(':');

  return `${prefix}:${filteredParams}`;
}
