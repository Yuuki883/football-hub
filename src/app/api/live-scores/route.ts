import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    // Redisキャッシュをチェック
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get('live-scores');
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    // ダミーデータ（実際にはAPIから取得）
    const scores = [
      {
        id: '12345',
        minute: '45',
        competition: { name: 'プレミアリーグ' },
        homeTeam: { name: 'アーセナル' },
        awayTeam: { name: 'チェルシー' },
        score: { home: 2, away: 1 },
      },
      {
        id: '67890',
        minute: '67',
        competition: { name: 'ラ・リーガ' },
        homeTeam: { name: 'バルセロナ' },
        awayTeam: { name: 'レアル・マドリード' },
        score: { home: 1, away: 1 },
      },
    ];

    // キャッシュに保存（5分間）
    if (redis) {
      await redis.set('live-scores', JSON.stringify(scores), {
        EX: 300, // 5分
      });
    }

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Failed to fetch live scores:', error);
    return NextResponse.json({ error: 'Failed to fetch live scores' }, { status: 500 });
  }
}
