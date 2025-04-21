import { getRedisClient } from '@/lib/redis';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
const API_BASE_URL = `https://${API_FOOTBALL_HOST}/v3`;

export function getApiHeaders(): Record<string, string> {
  if (!API_FOOTBALL_KEY) {
    throw new Error('API_FOOTBALL_KEY is not defined');
  }
  return {
    'x-apisports-key': API_FOOTBALL_KEY,
  };
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
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
    const response = await fetch(
      `${getApiBaseUrl()}/fixtures?league=39&season=2024`,
      {
        method: 'GET',
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // レスポンスを整形してアプリで使いやすい形式に変換
    const scores = data.response.map((fixture: any) => ({
      id: fixture.fixture.id.toString(),
      competition: {
        name: fixture.league.name,
        emblem: fixture.league.logo,
      },
      minute: fixture.fixture.status.elapsed?.toString() || '0',
      homeTeam: {
        name: fixture.teams.home.name,
        crest: fixture.teams.home.logo,
      },
      awayTeam: {
        name: fixture.teams.away.name,
        crest: fixture.teams.away.logo,
      },
      score: {
        home: fixture.goals.home,
        away: fixture.goals.away,
      },
    }));

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
export async function getFixturesByDate(date: string) {
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
    const response = await fetch(`${getApiBaseUrl()}/fixtures?date=${date}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // レスポンスを整形
    const fixtures = data.response.map((fixture: any) => ({
      id: fixture.fixture.id.toString(),
      utcDate: fixture.fixture.date,
      status: fixture.fixture.status.short,
      matchday: fixture.league.round,
      competition: {
        id: fixture.league.id.toString(),
        name: fixture.league.name,
        code: fixture.league.country,
        type: fixture.league.type,
        emblem: fixture.league.logo,
      },
      homeTeam: {
        id: fixture.teams.home.id.toString(),
        name: fixture.teams.home.name,
        shortName: fixture.teams.home.name,
        crest: fixture.teams.home.logo,
      },
      awayTeam: {
        id: fixture.teams.away.id.toString(),
        name: fixture.teams.away.name,
        shortName: fixture.teams.away.name,
        crest: fixture.teams.away.logo,
      },
      score: {
        home: fixture.goals.home,
        away: fixture.goals.away,
      },
      venue: fixture.fixture.venue?.name || '',
    }));

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
 * @param leagueId リーグID
 */
export async function getLeagueMatches(leagueId: string) {
  try {
    if (typeof window !== 'undefined') {
      console.warn('getLeagueMatches was called on the client side');
      return [];
    }

    // リーグIDからAPI-Football用のリーグIDに変換
    // API-Footballは数値IDを使用するが、アプリでは文字列コードを使用している可能性があるため
    const leagueMapping: Record<string, number> = {
      PL: 39, // プレミアリーグ
      PD: 140, // ラ・リーガ
      BL1: 78, // ブンデスリーガ
      SA: 135, // セリエA
      FL1: 61, // リーグ・アン
      CL: 2, // UEFAチャンピオンズリーグ
    };

    const apiLeagueId = leagueMapping[leagueId] || parseInt(leagueId, 10);
    if (!apiLeagueId) {
      throw new Error(`Invalid league ID: ${leagueId}`);
    }

    // Redisキャッシュをチェック
    const redis = await getRedisClient();
    const cacheKey = `league-matches:${leagueId}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // 現在の日付とその7日後を計算
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = nextWeek.toISOString().split('T')[0];

    // API-Footballからリーグの試合を取得
    const response = await fetch(
      `${getApiBaseUrl()}/fixtures?league=${apiLeagueId}&season=${today.getFullYear()}&from=${dateFrom}&to=${dateTo}`,
      {
        method: 'GET',
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // レスポンスを整形
    const matches = data.response
      .map((fixture: any) => ({
        id: fixture.fixture.id.toString(),
        utcDate: fixture.fixture.date,
        status: fixture.fixture.status.short,
        matchday: fixture.league.round,
        competition: {
          id: fixture.league.id.toString(),
          name: fixture.league.name,
          code: fixture.league.country,
          type: fixture.league.type,
          emblem: fixture.league.logo,
        },
        homeTeam: {
          id: fixture.teams.home.id.toString(),
          name: fixture.teams.home.name,
          shortName: fixture.teams.home.name,
          crest: fixture.teams.home.logo,
        },
        awayTeam: {
          id: fixture.teams.away.id.toString(),
          name: fixture.teams.away.name,
          shortName: fixture.teams.away.name,
          crest: fixture.teams.away.logo,
        },
        score: {
          home: fixture.goals.home,
          away: fixture.goals.away,
        },
        venue: fixture.fixture.venue?.name || '',
      }))
      .slice(0, 10); // 最大10試合に制限

    // キャッシュに保存（3時間）
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(matches), {
        EX: 3 * 60 * 60, // 3時間
      });
    }

    return matches;
  } catch (error) {
    console.error(`Failed to fetch matches for league ${leagueId}:`, error);
    return [];
  }
}
