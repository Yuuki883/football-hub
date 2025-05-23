/**
 * アプリケーション全体で使用する共通ドメインモデル
 *
 * 基本的な型定義を集約し、アプリケーション全体で一貫した型を提供します。
 */

// 基本的なチーム情報
export interface Team {
  id: number;
  name: string;
  logo: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

// 基本的な選手情報
export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  nationality?: string;
  position?: string;
  age?: number;
}

// 基本的なリーグ情報
export interface League {
  id: number;
  name: string;
  logo: string;
  country?: Country;
}

// 基本的な国情報
export interface Country {
  name: string;
  code?: string;
  flag?: string;
}

// 基本的な統計情報インターフェース
export interface BasicStats {
  appearances?: number;
  minutes?: number;
  goals?: number;
  assists?: number;
}

// APIレスポンスの共通型
export interface ApiResponse<T> {
  errors?: string[];
  results?: number;
  paging?: {
    current: number;
    total: number;
  };
  response: T;
}

// シーズン情報
export interface Season {
  year: number;
  start: string;
  end: string;
  current: boolean;
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

// 試合関連の型定義
export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner: string | null;
    duration: string;
    fullTime: Score;
    halfTime: Score;
    home: number | null;
    away: number | null;
  };
  competition: Competition;
  minute?: number;
}
