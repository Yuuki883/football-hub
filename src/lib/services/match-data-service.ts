import { getRedisClient, cacheGet, cacheSet } from '@/lib/redis';

/**
 * 試合情報取得
 *
 * API-Footballから試合データを取得して表示
 * Redisキャッシュを利用して必要な時だけAPIを呼び出す
 *
 * 主な機能:
 * - リーグ別の試合データ取得
 * - リーグの順位表取得
 */

// API-Football APIのアクセスキー
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST;
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL;

// リーグID (API-Football)
const LEAGUE_ID_MAPPING: Record<string, number> = {
  PL: 39, // プレミアリーグ
  PD: 140, // ラ・リーガ
  BL1: 78, // ブンデスリーガ
  SA: 135, // セリエA
  FL1: 61, // リーグ・アン
  CL: 2, // チャンピオンズリーグ
  EL: 3, // ヨーロッパリーグ
  ECL: 848, // カンファレンスリーグ
};

// リーグのシーズン情報
const DEFAULT_SEASON = '2024';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Competition {
  id: string;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Match {
  id: string;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  competition: Competition;
  venue?: string;
  matchday?: string;
}

/**
 * キャッシュ処理を統一するヘルパー関数
 *
 * @param cacheKey キャッシュキー
 * @param fetchFn データ取得関数
 * @param ttlSeconds キャッシュ有効期間（秒）
 * @param forceRefresh キャッシュを無視して強制更新するかどうか
 */
async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number,
  forceRefresh = false
): Promise<T> {
  // キャッシュ確認（forceRefresh=trueの場合はスキップ）
  if (!forceRefresh) {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
  }

  // データ取得
  const data = await fetchFn();

  // キャッシュ保存
  await cacheSet(cacheKey, data, ttlSeconds);

  return data;
}

/**
 * API-Football形式の試合データをアプリで使用する形式に変換
 *
 * @param fixture API-Footballから返される試合データ
 * @returns アプリで統一された形式の試合データ
 */
function formatMatch(fixture: any): Match {
  return {
    id: fixture.fixture.id.toString(),
    utcDate: fixture.fixture.date,
    status: fixture.fixture.status.short,
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
    competition: {
      id: fixture.league.id.toString(),
      name: fixture.league.name,
      code:
        Object.keys(LEAGUE_ID_MAPPING).find(
          (key) => LEAGUE_ID_MAPPING[key] === fixture.league.id
        ) || fixture.league.id.toString(),
      type: 'LEAGUE',
      emblem: fixture.league.logo,
    },
    venue: fixture.fixture.venue?.name,
    matchday: fixture.league.round,
  };
}

/**
 * 複数の試合データをフォーマットする
 */
function formatMatches(fixtures: any[]): Match[] {
  return fixtures.map((fixture) => formatMatch(fixture));
}

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
 * 特定リーグの試合データを取得
 *
 * 指定されたリーグコードの7日間の試合データを取得
 * キャッシュ期間: 3時間
 *
 * @param leagueCode リーグコード（PL, PD, BL1, SA, FL1, CLなど）
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 試合データの配列（最大10件）
 */
export async function getMatchesByLeague(
  leagueCode: string,
  season = DEFAULT_SEASON
) {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`サポートされていないリーグコードです: ${leagueCode}`);
  }

  // キャッシュキーの作成
  const cacheKey = `league-matches-${leagueCode}-${season}`;
  const cacheTTL = 3 * 60 * 60; // 3時間キャッシュ

  return withCache(
    cacheKey,
    async () => {
      // 現在の日付から7日以内と今後90日の試合を取得（期間を広げる）
      const today = new Date();
      const ninetyDaysLater = new Date(today);
      ninetyDaysLater.setDate(today.getDate() + 90);

      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = ninetyDaysLater.toISOString().split('T')[0];

      // API リクエスト
      const url = `${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${season}&from=${dateFrom}&to=${dateTo}&timezone=Asia/Tokyo`;
      const data = await fetchFromAPI(url);

      // API-Football形式からアプリ形式に変換して返す
      return data.response && data.response.length > 0
        ? data.response
            .slice(0, 10) // 最大10試合に制限
            .map((fixture: any) => formatMatch(fixture))
        : [];
    },
    cacheTTL
  );
}

/**
 * 特定の日付範囲の試合を取得
 *
 * @param leagueCode リーグコード
 * @param dateFrom 開始日（YYYY-MM-DD形式）
 * @param dateTo 終了日（YYYY-MM-DD形式）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 試合データの配列
 */
export async function getMatchesByDateRange(
  leagueCode: string,
  dateFrom: string,
  dateTo: string,
  forceRefresh: boolean = false,
  season = DEFAULT_SEASON
) {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`リーグコードが存在しません: ${leagueCode}`);
  }

  // キャッシュキーの作成
  const cacheKey = `league-matches-${leagueCode}-${dateFrom}-${dateTo}-${season}`;
  const cacheTTL = 6 * 60 * 60; // デフォルトは6時間（親のルートで上書きされる）

  return withCache(
    cacheKey,
    async () => {
      // API リクエスト
      const url = `${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${season}&from=${dateFrom}&to=${dateTo}&timezone=Asia/Tokyo`;
      const data = await fetchFromAPI(url);

      // API-Football形式からアプリ形式に変換
      return data.response && data.response.length > 0
        ? data.response.map((fixture: any) => formatMatch(fixture))
        : [];
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * 指定された日付の全リーグの試合データを一括取得
 *
 *
 * @param date 日付（YYYY-MM-DD形式）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 全リーグの試合データの配列（時間順にソート済み）
 */
export async function getAllLeagueMatches(
  date: string,
  forceRefresh: boolean = false,
  season = DEFAULT_SEASON
) {
  // キャッシュキーを作成
  const cacheKey = `all-leagues-matches:${date}:${season}`;
  // 過去・現在・未来の試合かによって異なるキャッシュ時間を設定（一時的）
  // ここでは3時間のキャッシュ期間を設定
  const cacheTTL = 3 * 60 * 60;

  return withCache(
    cacheKey,
    async () => {
      // 全リーグのコード一覧
      const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
      let allMatches: Match[] = [];

      // 並列処理で全リーグの試合を取得
      const matchPromises = leagueCodes.map((code) =>
        getMatchesByDateRange(code, date, date, false, season).catch(
          (error) => {
            console.error(`Error fetching matches for league ${code}:`, error);
            return []; // エラー時は空配列を返してプロセスを継続
          }
        )
      );

      const results = await Promise.all(matchPromises);

      // 結果をマージ
      results.forEach((matches) => {
        if (matches && matches.length > 0) {
          allMatches = [...allMatches, ...matches];
        }
      });

      // 試合開始時間順にソート
      allMatches.sort(
        (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
      );

      return allMatches;
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * リーグの順位表を取得する
 * @param leagueCode リーグコード
 * @param season シーズン（デフォルト: 現在のシーズン）
 * @returns 順位表データ
 */
export async function getLeagueStandings(
  leagueCode: string,
  season = DEFAULT_SEASON
) {
  if (!leagueCode) {
    return [];
  }

  // リーグIDを取得
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    console.error(`Invalid league code: ${leagueCode}`);
    return [];
  }

  // キャッシュキーを作成
  const cacheKey = `league-standings:${leagueCode}:${season}`;
  const cacheTTL = 12 * 60 * 60; // 12時間キャッシュ（順位表は比較的安定しているため長め）

  return withCache(
    cacheKey,
    async () => {
      // API リクエスト
      const url = `${API_FOOTBALL_BASE_URL}/standings?league=${leagueId}&season=${season}`;
      const data = await fetchFromAPI(url);

      // 順位表データを整形
      if (
        data.response &&
        data.response.length > 0 &&
        data.response[0].league.standings.length > 0
      ) {
        return data.response[0].league.standings[0].map((team: any) => ({
          position: team.rank,
          team: {
            id: team.team.id.toString(),
            name: team.team.name,
            shortName: team.team.name,
            crest: team.team.logo,
          },
          playedGames: team.all.played,
          won: team.all.win,
          draw: team.all.draw,
          lost: team.all.lose,
          points: team.points,
          goalsFor: team.all.goals.for,
          goalsAgainst: team.all.goals.against,
          goalDifference: team.goalsDiff,
          form: team.form,
        }));
      }

      return [];
    },
    cacheTTL
  );
}

/**
 * リーグの試合日付を一覧で取得
 * （軽量API呼び出し）
 *
 * @param leagueCode リーグコード
 * @param season シーズン（デフォルト: 現在のシーズン）
 * @returns 試合日付の配列 (YYYY-MM-DD形式)
 */
export async function getMatchDatesForLeague(
  leagueCode: string,
  season = DEFAULT_SEASON
) {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`サポートされていないリーグコードです: ${leagueCode}`);
  }

  // キャッシュキーを作成
  const cacheKey = `match-dates:${leagueCode}:${season}`;
  const cacheTTL = 7 * 24 * 60 * 60; // 1週間キャッシュ（試合スケジュールは比較的安定）

  return withCache(
    cacheKey,
    async () => {
      // API-Footballから日付のみを取得
      const url = `${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${season}`;

      const data = await fetchFromAPI(url);

      // 日付のみを抽出して重複を排除
      const dateSet = new Set<string>();
      if (data.response && data.response.length > 0) {
        data.response.forEach((fixture: any) => {
          const matchDate = new Date(fixture.fixture.date);
          const dateString = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
          dateSet.add(dateString);
        });
      }

      // Set を配列に変換して日付順にソート
      return Array.from(dateSet).sort();
    },
    cacheTTL
  );
}

/**
 * 全リーグの試合日程を取得
 *
 * @param season シーズン
 * @returns リーグコードをキー、日付配列を値とするオブジェクト
 */
export async function getAllLeagueMatchDates(season = DEFAULT_SEASON) {
  // キャッシュキーを作成
  const cacheKey = `all-league-match-dates:${season}`;
  const cacheTTL = 24 * 60 * 60; // 1日キャッシュ

  return withCache(
    cacheKey,
    async () => {
      const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
      const result: Record<string, string[]> = {};

      // 並列に全リーグの日程を取得
      const promises = leagueCodes.map(async (code) => {
        const dates = await getMatchDatesForLeague(code, season);
        result[code] = dates;
      });

      await Promise.all(promises);
      return result;
    },
    cacheTTL
  );
}
