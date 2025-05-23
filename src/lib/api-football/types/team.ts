/**
 * API-Football チームデータの型定義
 */

/**
 * API-Football チーム生データの型定義
 */
export interface ApiFootballTeamRaw {
  id: number;
  name: string;
  code: string | null;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

/**
 * API-Football チーム詳細生データの型定義
 */
export interface ApiFootballTeamDetailRaw {
  team: ApiFootballTeamRaw;
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

/**
 * API-Football チームリストレスポンス
 */
export interface ApiFootballTeamsResponse {
  response: ApiFootballTeamDetailRaw[];
}

/**
 * API-Football チーム統計生データ
 */
export interface ApiFootballTeamStatsRaw {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
  lineups?: Array<{
    formation: string;
    played: number;
  }>;
  clean_sheet?: {
    home: number;
    away: number;
    total: number;
  };
  failed_to_score?: {
    home: number;
    away: number;
    total: number;
  };
}

/**
 * API-Football スクワッド生データ
 */
export interface ApiFootballSquadRaw {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  players: Array<{
    id: number;
    name: string;
    age: number;
    number: number | null;
    position: string;
    photo: string;
    nationality?: string;
    height?: string;
    weight?: string;
  }>;
}

/**
 * チーム情報取得パラメータ
 */
export interface TeamApiParams {
  id?: number | string;
  league?: number | string;
  season?: number | string;
  search?: string;
}

/**
 * チームリスト取得パラメータ
 */
export interface TeamsApiParams {
  league?: number | string;
  season?: number | string;
  country?: string;
}

/**
 * チーム統計取得パラメータ
 */
export interface TeamStatsApiParams {
  team: number | string;
  league: number | string;
  season?: number | string;
}

/**
 * チームスクワッド取得パラメータ
 */
export interface TeamSquadApiParams {
  team: number | string;
}
