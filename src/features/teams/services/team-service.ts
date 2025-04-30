import { getRedisClient } from '@/lib/redis';

// API-Football APIの設定
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST;
const API_FOOTBALL_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || `https://${API_FOOTBALL_HOST}/v3`;

/**
 * API-Footballからデータを取得する共通関数
 */
async function fetchFromAPI(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * キャッシュ付きでデータを取得する共通関数
 */
async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 3600 // デフォルト1時間
): Promise<T> {
  try {
    const redis = await getRedisClient();

    // Redisが利用可能な場合、キャッシュを確認
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // キャッシュに無い場合はデータを取得
    const data = await fetchFunction();

    // 取得したデータをキャッシュに保存
    if (redis && data) {
      await redis.set(cacheKey, JSON.stringify(data), {
        EX: ttl,
      });
    }

    return data;
  } catch (error) {
    console.error(`Cache operation failed for key ${cacheKey}:`, error);
    // キャッシュ操作が失敗しても、実際のデータ取得は試みる
    return fetchFunction();
  }
}

/**
 * チームの基本情報を取得する
 *
 * @param teamId チームID
 * @returns チーム情報
 */
export async function getTeamById(teamId: number | string) {
  if (!teamId) {
    throw new Error('チームIDが指定されていません');
  }

  // キャッシュキーを作成
  const cacheKey = `team:${teamId}`;
  const cacheTTL = 24 * 60 * 60; // 24時間（チーム情報は頻繁に変わらない）

  return withCache(
    cacheKey,
    async () => {
      const url = `${API_FOOTBALL_BASE_URL}/teams?id=${teamId}`;

      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return null;
      }

      return data.response[0];
    },
    cacheTTL
  );
}
