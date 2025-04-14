// src/lib/redis.ts
import { createClient } from 'redis';

// Redisクライアントの設定
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// クライアントのシングルトンインスタンス
let redis: ReturnType<typeof createClient>;

// Redisクライアントを取得（必要に応じて接続）
export const getRedisClient = async () => {
  // サーバーサイドでのみ実行
  if (typeof window === 'undefined') {
    // 初回実行時またはクライアントが未定義の場合に作成
    if (!redis) {
      redis = createClient({
        url: redisUrl,
      });

      // 未接続の場合は接続
      if (!redis.isOpen) {
        await redis.connect().catch((err: Error) => {
          console.error('Redis connection error:', err);
        });
      }
    }
    return redis;
  }

  // クライアントサイドではnullを返す（または適切なモックを返す）
  return null;
};
