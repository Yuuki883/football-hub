import { getRedisClient } from '@/lib/redis';

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FOOTBALL_DATA_API_BASE_URL = 'https://api.football-data.org/v4';

export async function getFeaturedMatches() {
  const redis = await getRedisClient();

  // キャッシュチェック
  const cacheKey = 'featured-matches';
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached as string);
  }

  try {
    // 現在日付から3日以内の注目試合を取得
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = threeDaysLater.toISOString().split('T')[0];

    const response = await fetch(
      `${FOOTBALL_DATA_API_BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_DATA_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // 注目試合を選択（トップリーグの大きな試合）
    const featuredMatches = data.matches
      .filter((match: any) => {
        // トップリーグの試合のみ
        const topLeagues = ['PL', 'PD', 'BL1', 'SA', 'FL1'];
        return topLeagues.includes(match.competition.code);
      })
      .slice(0, 3); // 最大3試合のみ

    // 6時間キャッシュ
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(featuredMatches), {
        EX: 6 * 60 * 60, // 6時間の有効期限
      });
    }

    return featuredMatches;
  } catch (error) {
    console.error('Failed to fetch featured matches:', error);
    return [];
  }
}

export async function getMatchesByLeague(leagueCode: string) {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  const redis = await getRedisClient();

  // キャッシュキーの作成
  const cacheKey = `league-matches-${leagueCode}`;

  // キャッシュの確認
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached as string);
  }

  try {
    // 現在の日付から7日以内の試合を取得
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = sevenDaysLater.toISOString().split('T')[0];

    // リーグ別の試合を取得
    const response = await fetch(
      `${FOOTBALL_DATA_API_BASE_URL}/competitions/${leagueCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`,
      {
        headers: {
          'X-Auth-Token': FOOTBALL_DATA_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const matches = data.matches.slice(0, 10); // 最大10試合に制限

    // 3時間キャッシュ
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(matches), {
        EX: 3 * 60 * 60, // 3時間の有効期限
      });
    }

    return matches;
  } catch (error) {
    console.error(`リーグ ${leagueCode} の試合取得に失敗しました:`, error);
    return [];
  }
}
