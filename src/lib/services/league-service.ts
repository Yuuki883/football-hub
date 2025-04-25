import { LeagueData, Standing, Match, Player } from '@/lib/types/football';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || '';
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL;

// 共通のヘッダーとオプションを設定
const fetchOptions = {
  headers: {
    'x-rapidapi-key': API_FOOTBALL_KEY,
    'x-rapidapi-host': API_FOOTBALL_HOST,
  },
  next: {
    revalidate: 3600, // 1時間ごとにデータを再検証
  },
};

// URLにクエリパラメータを追加するヘルパー関数
function createUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(`${API_FOOTBALL_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  return url.toString();
}

export async function getLeagueById(
  id: number | string
): Promise<LeagueData | null> {
  const response = await fetch(createUrl('/leagues', { id }), fetchOptions);
  const data = await response.json();
  return data.response[0] || null;
}

/**
 * リーグスラグからリーグデータを取得
 * 対象は欧州5大リーグとUEFA主要大会
 */
export async function getLeagueBySlug(
  slug: string
): Promise<LeagueData | null> {
  // 対象リーグのスラグとIDのマッピング
  const leagueMapping: Record<string, number> = {
    // 欧州5大リーグ
    'premier-league': 39,
    laliga: 140,
    'la-liga': 140,
    bundesliga: 78,
    'serie-a': 135,
    'ligue-1': 61,

    // UEFA主要大会
    'champions-league': 2,
    'europa-league': 3,
    'conference-league': 848,
  };

  // マッピングにあればIDで直接取得
  if (leagueMapping[slug]) {
    return getLeagueById(leagueMapping[slug]);
  }

  // マッピングになければ該当リーグなし
  return null;
}

/**
 * リーグの順位表を取得
 */
export async function getLeagueStandings(
  leagueIdOrSlug: number | string,
  season: number = 2024
): Promise<any> {
  try {
    const isNumeric = !isNaN(Number(leagueIdOrSlug));
    let leagueId = leagueIdOrSlug;

    if (!isNumeric) {
      const league = await getLeagueBySlug(leagueIdOrSlug as string);
      if (!league) {
        console.error('リーグIDが見つかりませんでした:', leagueIdOrSlug);
        return [];
      }
      leagueId = league.league.id;
    }

    const apiUrl = `${API_FOOTBALL_BASE_URL}/standings?league=${leagueId}&season=${season}`;
    const response = await fetch(apiUrl, {
      headers: fetchOptions.headers,
      next: { revalidate: 3600 }, // 1時間ごとに再検証
    });

    if (!response.ok) {
      console.error('API応答エラー:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.log(
        `${leagueIdOrSlug}の順位表データが見つかりません (シーズン: ${season})`
      );
      return [];
    }

    // Champions League, Europa League, Conference Leagueの場合は複数グループがある
    if (
      ['champions-league', 'europa-league', 'conference-league'].includes(
        leagueIdOrSlug as string
      ) ||
      [2, 3, 848].includes(Number(leagueId))
    ) {
      // レスポンスの構造を確認
      const firstItem = data.response[0];

      // すでに複数グループの場合はそのまま返す
      if (Array.isArray(firstItem.league.standings)) {
        // すでに複数グループの配列が含まれている場合
        return firstItem.league.standings;
      } else {
        // 単一グループの場合は配列に包んで返す
        return [firstItem.league.standings];
      }
    }

    // 通常のリーグの場合
    return data.response[0]?.league?.standings || [];
  } catch (error) {
    console.error('順位表の取得中にエラーが発生しました:', error);
    return [];
  }
}

/**
 * リーグの試合を取得
 */
export async function getLeagueMatches(
  leagueIdOrSlug: number | string,
  season: number
): Promise<Match[] | null> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    const league = await getLeagueBySlug(leagueIdOrSlug);
    if (!league) return null;
    leagueId = league.league.id;
  }

  try {
    const response = await fetch(
      createUrl('/fixtures', { league: leagueId, season }),
      fetchOptions
    );
    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return null;
  }
}

/**
 * リーグの得点ランキングを取得
 */
export async function getLeagueTopScorers(
  leagueIdOrSlug: number | string,
  season: number
): Promise<Player[] | null> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    const league = await getLeagueBySlug(leagueIdOrSlug);
    if (!league) return null;
    leagueId = league.league.id;
  }

  try {
    const response = await fetch(
      createUrl('/players/topscorers', { league: leagueId, season }),
      fetchOptions
    );
    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    return null;
  }
}

/**
 * リーグのアシストランキングを取得
 */
export async function getLeagueTopAssists(
  leagueIdOrSlug: number | string,
  season: number
): Promise<Player[] | null> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    const league = await getLeagueBySlug(leagueIdOrSlug);
    if (!league) return null;
    leagueId = league.league.id;
  }

  try {
    const response = await fetch(
      createUrl('/players/topassists', { league: leagueId, season }),
      fetchOptions
    );
    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Error fetching top assists:', error);
    return null;
  }
}

/**
 * リーグのチーム一覧を取得
 */
export async function getLeagueTeams(
  leagueIdOrSlug: number | string,
  season: number
) {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    const league = await getLeagueBySlug(leagueIdOrSlug);
    if (!league) return null;
    leagueId = league.league.id;
  }

  try {
    const response = await fetch(
      createUrl('/teams', { league: leagueId, season }),
      fetchOptions
    );
    const data = await response.json();
    return data.response || null;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return null;
  }
}
