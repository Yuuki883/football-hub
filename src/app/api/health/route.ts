import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

/**
 * システムヘルスチェックAPI
 *
 * Redis接続状態を確認し、システムの健全性を報告します
 *
 * レスポンス:
 * - 200: システムは正常に動作
 * - 503: Redis接続エラー
 */
export async function GET() {
  try {
    // Redisクライアントの取得を試みる
    const redis = await getRedisClient();

    if (!redis) {
      console.error('Redis client could not be initialized');
      return NextResponse.json(
        { status: 'error', message: 'Redis connection failed' },
        { status: 503 }
      );
    }

    // Redis接続テスト
    await redis.ping();

    return NextResponse.json(
      {
        status: 'ok',
        redis: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'System health check failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
