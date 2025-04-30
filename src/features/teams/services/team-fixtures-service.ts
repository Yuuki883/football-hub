import { Match } from '@/lib/types/football';
import { getRedisClient } from '@/lib/redis';

// API-Football APIの設定
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST =
  process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
const API_FOOTBALL_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || `https://${API_FOOTBALL_HOST}/v3`;

// デフォルトのシーズン設定
const DEFAULT_SEASON = '2024';

/**
 * API-Footballからデータを取得する共通関数
 */
async function fetchFromAPI(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * キャッシュ付きでデータを取得する共通関数
 */
async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 3600 // デフォルト1時間
): Promise<T> {
  try {
    const redis = await getRedisClient();

    // Redisが利用可能な場合、キャッシュを確認
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // キャッシュに無い場合はデータを取得
    const data = await fetchFunction();

    // 取得したデータをキャッシュに保存
    if (redis && data) {
      await redis.set(cacheKey, JSON.stringify(data), {
        EX: ttl,
      });
    }

    return data;
  } catch (error) {
    console.error(`Cache operation failed for key ${cacheKey}:`, error);
    // キャッシュ操作が失敗しても、実際のデータ取得は試みる
    return fetchFunction();
  }
}

/**
 * チームの試合日程を取得する
 *
 * @param teamId チームID
 * @param params 取得パラメータ
 * @returns 試合データの配列
 */
export async function getTeamFixtures(
  teamId: number | string,
  params: {
    season?: number | string;
    past?: boolean;
    future?: boolean;
    limit?: number;
  } = {}
): Promise<Match[]> {
  const {
    season = DEFAULT_SEASON,
    past = true,
    future = true,
    limit = 5,
  } = params;

  // 現在の日付を取得
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  // 過去と未来の試合を取得するための日付範囲を計算
  let dateFrom, dateTo;

  if (past && !future) {
    // 過去の試合のみ
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 90); // 過去90日
    dateFrom = pastDate.toISOString().split('T')[0];
    dateTo = formattedToday;
  } else if (!past && future) {
    // 将来の試合のみ
    dateFrom = formattedToday;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 90); // 今後90日
    dateTo = futureDate.toISOString().split('T')[0];
  } else {
    // 両方（デフォルト）
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 90);
    dateFrom = pastDate.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 90);
    dateTo = futureDate.toISOString().split('T')[0];
  }

  // キャッシュキーを作成
  const cacheKey = `team-fixtures:${teamId}:${season}:${dateFrom}:${dateTo}`;
  const cacheTTL = 3 * 60 * 60; // 3時間

  return withCache(
    cacheKey,
    async () => {
      // APIリクエストURLを構築
      const url = `${API_FOOTBALL_BASE_URL}/fixtures?team=${teamId}&season=${season}&from=${dateFrom}&to=${dateTo}`;

      const data = await fetchFromAPI(url);

      // 結果がない場合は空配列を返す
      if (!data.response || data.response.length === 0) {
        return [];
      }

      // 日付でソート
      const allMatches = [...data.response];
      allMatches.sort((a: any, b: any) => {
        return (
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
        );
      });

      // 過去と未来の試合を分ける
      const pastMatches: any[] = [];
      const futureMatches: any[] = [];

      allMatches.forEach((match: any) => {
        const matchDate = new Date(match.fixture.date);
        if (matchDate < today) {
          pastMatches.push(match);
        } else {
          futureMatches.push(match);
        }
      });

      // 必要な試合のみを選択
      let selectedMatches: any[] = [];

      if (past) {
        // 過去の試合を新しい順に追加
        selectedMatches = [...pastMatches.reverse().slice(0, limit)];
      }

      if (future) {
        // 未来の試合を近い順に追加
        selectedMatches = [
          ...selectedMatches,
          ...futureMatches.slice(0, limit),
        ];
      }

      // 日付順にソート
      selectedMatches.sort((a: any, b: any) => {
        return (
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
        );
      });

      return selectedMatches;
    },
    cacheTTL
  );
}
