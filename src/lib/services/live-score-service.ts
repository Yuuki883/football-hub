import { getRedisClient } from '@/lib/redis';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

export async function getLiveScores() {
  try {
    if (typeof window !== 'undefined') {
      console.warn('getLiveScores was called on the client side');
      return [];
    }

    // Redisキャッシュをチェック
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get('live-scores');
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // ダミーデータ（実際にはAPIから取得）
    const scores = [
      {
        id: '12345',
        competition: { name: 'プレミアリーグ', emblem: '/premier-league.svg' },
        minute: '45',
        homeTeam: { name: 'Arsenal', crest: '/teams/arsenal.svg' },
        awayTeam: { name: 'Chelsea', crest: '/teams/chelsea.svg' },
        score: { home: 2, away: 1 },
      },
      {
        id: '67890',
        competition: { name: 'ラ・リーガ', emblem: '/la-liga.svg' },
        minute: '67',
        homeTeam: { name: 'Barcelona', crest: '/teams/barcelona.svg' },
        awayTeam: { name: 'Real Madrid', crest: '/teams/real-madrid.svg' },
        score: { home: 1, away: 1 },
      },
    ];

    // キャッシュに保存（5分間）
    if (redis) {
      await redis.set('live-scores', JSON.stringify(scores), {
        EX: 300, // 5分
      });
    }

    return scores;
  } catch (error) {
    console.error('Failed to fetch live scores:', error);
    return [];
  }
}
