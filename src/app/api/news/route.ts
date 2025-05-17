import { NextResponse } from 'next/server';
import { fetchNews } from '@/features/news/api/news';
import { getRedisClient } from '@/lib/redis';

// APIルートが動的であることを明示
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // クエリパラメータを解析
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 6;

    // キャッシュキーにlimitを含める
    const cacheKey = `news-items-${limit}`;

    // Redisからキャッシュをチェック
    const redis = await getRedisClient();

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    // キャッシュがなければRSSフィードから取得
    const newsItems = await fetchNews(limit);

    // 30分キャッシュ
    if (redis && newsItems.length > 0) {
      await redis.set(cacheKey, JSON.stringify(newsItems), {
        EX: 30 * 60, // 30分
      });
    }

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return NextResponse.json({ error: 'ニュースの取得に失敗しました' }, { status: 500 });
  }
}
