import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

let redisClient: any = null;

export const getRedisClient = async () => {
  if (typeof window !== 'undefined') return null;

  // すでに初期化済みならそれを返す
  if (redisClient) return redisClient;

  // 環境変数でどちらのクライアントを使うか判断
  const useUpstash =
    process.env.USE_UPSTASH_REDIS === 'true' || process.env.VERCEL === 'true';

  if (useUpstash) {
    // Upstash Redis (Vercel環境用)
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_URL || '',
      token: process.env.UPSTASH_REDIS_TOKEN || '',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Using Upstash Redis client');
    }
  } else {
    // 通常のRedis (Docker開発環境用)
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    try {
      if (!client.isOpen) await client.connect();
    } catch (err) {
      console.error('Redis connection error:', err);
      return null;
    }

    redisClient = client;

    if (process.env.NODE_ENV === 'development') {
      console.log('Using standard Redis client');
    }
  }

  return redisClient;
};
