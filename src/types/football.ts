/**
 * サッカー関連のドメイン型定義
 *
 * アプリケーション全体で使用する基本的なエンティティの型を定義
 * これらはAPI形式から独立した、ドメインモデルとして定義。
 */

// リーグ関連の型定義
export interface League {
  id: number;
  name: string;
  type?: string;
  logo: string;
  slug?: string;
}

export interface Country {
  name: string;
  code?: string;
  flag?: string;
}

export interface LeagueData {
  league: League;
  country: Country;
  seasons?: Season[];
}

export interface Season {
  year: number;
  start: string;
  end: string;
  current: boolean;
}

// チーム関連の型定義
export interface Team {
  id: number;
  name: string;
  shortName?: string;
  logo: string;
  crest?: string; // 新しいAPI形式との互換性のため
}

// 選手関連の型定義
export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  position?: string;
  nationality?: string;
  photo?: string;
}

// 順位表関連の型定義
export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  played?: number;
  won?: number;
  draw?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
}

// スコア関連の型定義
export interface Score {
  home: number | null;
  away: number | null;
}
