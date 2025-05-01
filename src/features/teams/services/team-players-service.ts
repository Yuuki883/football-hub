import { getRedisClient } from '@/lib/redis';

// API-Football APIの設定
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST;
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL;

// プレイヤーデータの型定義
export interface Player {
  id: number;
  name: string;
  age: number;
  number?: number;
  position: string;
  photo: string;
  nationality?: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  rating?: string | null;
  marketValue?: string | null;
}

// ポジショングループの型定義
export interface PlayerGroup {
  position: string;
  displayName: string;
  players: Player[];
}

/**
 * API-Footballからデータを取得する共通関数
 */
async function fetchFromAPI(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_FOOTBALL_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`APIリクエストエラー: ${url}`, error);
    throw error;
  }
}

/**
 * キャッシュ付きでデータを取得する共通関数
 */
async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 3600, // デフォルト1時間
  forceRefresh: boolean = false
): Promise<T> {
  try {
    const redis = await getRedisClient();

    // 強制リフレッシュが指定されていない場合、Redisからキャッシュを取得
    if (!forceRefresh && redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // キャッシュに無い場合または強制リフレッシュ時はデータを取得
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
 * チームの現在のスクワッド（選手一覧）を取得する
 */
export async function getTeamPlayers(
  teamId: string | number,
  forceRefresh: boolean = false
): Promise<Player[]> {
  if (!teamId) {
    throw new Error('チームIDが指定されていません');
  }

  // キャッシュキーを作成（現在のスクワッドはシーズンに依存しない）
  const cacheKey = `team:${teamId}:squad`;
  const cacheTTL = 24 * 60 * 60; // 24時間

  return withCache(
    cacheKey,
    async () => {
      // 新しいAPIエンドポイントを使用
      const url = `${API_FOOTBALL_BASE_URL}/players/squads?team=${teamId}`;

      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return [];
      }

      // APIレスポンスからプレイヤーデータを抽出
      const squadData = data.response[0];

      if (!squadData.players || squadData.players.length === 0) {
        return [];
      }

      // 国籍と国名のマッピングのために国一覧を取得
      const countriesMap = await getCountriesMap();

      // 現在のスクワッドデータをアプリケーションの形式に変換
      return squadData.players.map((player: any) => ({
        id: player.id,
        name: player.name,
        age: player.age || 25,
        number: player.number,
        position: player.position || 'Unknown',
        photo: player.photo,
        nationality: player.nationality,
        flag: player.nationality ? countriesMap[player.nationality] : undefined,
        height: player.height,
        weight: player.weight,
        injured: false,
        rating: null,
        marketValue: null,
      }));
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * 国名から国旗のURLを取得するためのマッピングを生成
 */
async function getCountriesMap(): Promise<Record<string, string>> {
  const cacheKey = 'countries:flags:map';
  const cacheTTL = 7 * 24 * 60 * 60; // 1週間キャッシュ（国旗情報は頻繁に変更されない）

  return withCache(
    cacheKey,
    async () => {
      try {
        // 国一覧を取得するAPIエンドポイント
        const url = `${API_FOOTBALL_BASE_URL}/countries`;
        const data = await fetchFromAPI(url);

        if (!data.response || !Array.isArray(data.response)) {
          return {};
        }

        // 国名と国旗URLのマッピングを作成
        const countriesMap: Record<string, string> = {};
        data.response.forEach((country: any) => {
          if (country.name && country.flag) {
            countriesMap[country.name] = country.flag;
          }
        });

        return countriesMap;
      } catch (error) {
        console.error('国リスト取得エラー:', error);
        return {}; // エラー時は空のマッピングを返す
      }
    },
    cacheTTL
  );
}

/**
 * 選手をポジション別にグループ化する
 */
export function groupPlayersByPosition(players: Player[]): PlayerGroup[] {
  // ポジションの表示順序とその表示名
  const positionOrder: Record<string, { order: number; displayName: string }> =
    {
      Goalkeeper: { order: 1, displayName: 'ゴールキーパー' },
      Defender: { order: 2, displayName: 'ディフェンダー' },
      Midfielder: { order: 3, displayName: 'ミッドフィールダー' },
      Attacker: { order: 4, displayName: 'アタッカー' },
      Unknown: { order: 999, displayName: 'その他' },
    };

  // ポジション名を標準化する関数
  const normalizePosition = (pos: string): string => {
    if (!pos) return 'Unknown';

    const positionMap: Record<string, string> = {
      G: 'Goalkeeper',
      GK: 'Goalkeeper',
      Goalkeeper: 'Goalkeeper',
      D: 'Defender',
      DF: 'Defender',
      Defender: 'Defender',
      M: 'Midfielder',
      MF: 'Midfielder',
      Midfielder: 'Midfielder',
      F: 'Attacker',
      FW: 'Attacker',
      Attacker: 'Attacker',
    };

    return positionMap[pos] || 'Unknown';
  };

  // 選手をポジション別に分類
  const groupedPlayers: Record<string, Player[]> = {};

  players.forEach((player) => {
    const normalizedPosition = normalizePosition(player.position);

    if (!groupedPlayers[normalizedPosition]) {
      groupedPlayers[normalizedPosition] = [];
    }

    groupedPlayers[normalizedPosition].push(player);
  });

  // グループ化されたデータを配列に変換して表示順にソート
  return Object.entries(groupedPlayers)
    .map(([position, players]) => ({
      position,
      displayName: positionOrder[position]?.displayName || position,
      players: players.sort((a, b) => (a.number || 99) - (b.number || 99)),
    }))
    .sort(
      (a, b) =>
        (positionOrder[a.position]?.order || 999) -
        (positionOrder[b.position]?.order || 999)
    );
}
