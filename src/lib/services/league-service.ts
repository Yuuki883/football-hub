import { LeagueData, Standing, Match, Player } from '@/lib/types/football';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
const API_BASE_URL = 'https://v3.football.api-sports.io';

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
  const url = new URL(`${API_BASE_URL}${endpoint}`);

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
  season: number
): Promise<Standing[][] | null> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    const league = await getLeagueBySlug(leagueIdOrSlug);
    if (!league) return null;
    leagueId = league.league.id;
  }

  try {
    const response = await fetch(
      createUrl('/standings', { league: leagueId, season }),
      fetchOptions
    );
    const data = await response.json();
    return data.response[0]?.league?.standings || null;
  } catch (error) {
    console.error('Error fetching standings:', error);
    return null;
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
