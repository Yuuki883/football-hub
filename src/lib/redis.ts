import { createClient } from 'redis';
import { Redis } from '@upstash/redis';

// Redisクライアント（シングルトン）
let redisClient: any = null;

/**
 * Redisクライアントを取得する
 * @returns Redisクライアントまたはnull (接続に失敗した場合)
 */
export async function getRedisClient(): Promise<any> {
  // クライアントサイドでは使用しない
  if (typeof window !== 'undefined') {
    return null;
  }

  // すでに初期化済みのクライアントがあれば再利用
  if (redisClient) {
    return redisClient;
  }

  try {
    // 環境変数に基づいてRedisクライアントを選択
    const useUpstash =
      process.env.USE_UPSTASH_REDIS === 'true' || process.env.VERCEL === 'true';

    if (
      useUpstash &&
      process.env.UPSTASH_REDIS_URL &&
      process.env.UPSTASH_REDIS_TOKEN
    ) {
      // Upstash Redis (Vercel環境用)
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN,
      });
      console.log('Connected to Upstash Redis');
    } else if (process.env.REDIS_URL) {
      // 通常のRedis (Docker開発環境用)
      const client = createClient({
        url: process.env.REDIS_URL,
      });

      client.on('error', (err) => {
        console.error('Redis client error:', err);
      });

      await client.connect();
      redisClient = client;
      console.log('Connected to Redis');
    } else {
      console.warn('No Redis configuration found');
      return null;
    }

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    return null;
  }
}

/**
 * Redisが利用可能かどうか確認する
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    if (!redis) return false;

    if (redis instanceof Redis) {
      await redis.ping();
    } else {
      await redis.ping();
    }
    return true;
  } catch (error) {
    console.error('Redis availability check failed:', error);
    return false;
  }
}

/**
 * キャッシュにデータを保存する
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const valueStr = JSON.stringify(value);

    if (redis instanceof Redis) {
      // Upstash Redis
      if (ttlSeconds) {
        await redis.set(key, valueStr, { ex: ttlSeconds });
      } else {
        await redis.set(key, valueStr);
      }
    } else {
      // Node Redis
      if (ttlSeconds) {
        await redis.set(key, valueStr, { EX: ttlSeconds });
      } else {
        await redis.set(key, valueStr);
      }
    }
  } catch (error) {
    console.error(`Error caching data for key: ${key}`, error);
  }
}

/**
 * キャッシュからデータを取得する
 */
export async function cacheGet(key: string): Promise<any | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) return null;

    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error(`Error retrieving cached data for key: ${key}`, error);
    return null;
  }
}
