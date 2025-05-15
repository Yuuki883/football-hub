import { getRedisClient } from '@/lib/redis';
import { API_FOOTBALL, DEFAULT_SEASON } from '@/config/api';
import { Match } from '@/lib/api-football/types';
import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { formatMatch } from '@/lib/api-football/fixtures';

/**
 * APIヘッダーを取得
 */
export function getApiHeaders(): Record<string, string> {
  if (!API_FOOTBALL.KEY) {
    throw new Error('API_FOOTBALL.KEY is not defined');
  }
  return {
    'x-apisports-key': API_FOOTBALL.KEY,
  };
}

/**
 * APIベースURLを取得
 */
export function getApiBaseUrl(): string {
  return API_FOOTBALL.BASE_URL;
}

/**
 * 現在進行中の試合情報を取得する
 */
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

    // API-Footballから現在のライブスコアを取得
    const url = createUrl('/fixtures', { live: 'all' });
    const data = await fetchFromAPI(url);

    // レスポンスを整形してアプリで使いやすい形式に変換
    const scores = data.response.map((fixture: any) => formatMatch(fixture));

    // キャッシュに保存（1分間 - ライブスコアは頻繁に更新されるため短めに設定）
    if (redis) {
      await redis.set('live-scores', JSON.stringify(scores), {
        EX: 60, // 1分
      });
    }

    return scores;
  } catch (error) {
    console.error('Failed to fetch live scores:', error);
    return [];
  }
}

/**
 * 特定の日付の試合情報を取得する
 */
export async function getFixturesByDate(date: string): Promise<Match[]> {
  try {
    if (typeof window !== 'undefined') {
      console.warn('getFixturesByDate was called on the client side');
      return [];
    }

    // Redisキャッシュをチェック
    const redis = await getRedisClient();
    const cacheKey = `fixtures-date:${date}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // API-Footballから特定日付の試合を取得
    const url = createUrl('/fixtures', { date });
    const data = await fetchFromAPI(url);

    // レスポンスを整形して返す
    const fixtures = data.response.map((fixture: any) => formatMatch(fixture));

    // キャッシュに保存（30分間）
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(fixtures), {
        EX: 30 * 60, // 30分
      });
    }

    return fixtures;
  } catch (error) {
    console.error(`Failed to fetch fixtures for date ${date}:`, error);
    return [];
  }
}

/**
 * 特定のリーグの試合情報を取得する
 *
 * このメソッドは後方互換性のために残されています。
 * 新しい実装では features/leagues/api/league-fixtures を使用してください。
 *
 * @param leagueId リーグID
 * @deprecated 代わりに features/leagues/api/league-fixtures の getLeagueFixtures を使用してください
 */
export async function getLeagueMatches(leagueId: string): Promise<Match[]> {
  try {
    if (typeof window !== 'undefined') {
      console.warn('getLeagueMatches was called on the client side');
      return [];
    }

    console.warn(
      'getLeagueMatches is deprecated. Use getLeagueFixtures from features/leagues/api/league-fixtures instead'
    );

    // 後方互換性のために、この関数自体は残しておきますが、
    // 機能は新しい実装を直接使用することをお勧め
    // このメソッドは将来的に削除される可能性があります。
    const { getLeagueFixtures } = await import('@/features/leagues/api/league-fixtures');
    return getLeagueFixtures(leagueId, {});
  } catch (error) {
    console.error(`Failed to fetch matches for league ${leagueId}:`, error);
    return [];
  }
}
