/**
 * アプリケーション全体で使用する共通ドメインモデル
 *
 * 基本的な型定義を集約し、アプリケーション全体で一貫した型を提供します。
 */

// 基本的なチーム情報
export interface Team {
  id: number | string;
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

// 基本的な選手統計情報（BasicStatsを拡張）
export interface BasicPlayerStats extends BasicStats {
  yellowCards?: number;
  redCards?: number;
  rating?: string;
}

// 基本的な選手詳細情報（新規追加）
export interface PlayerProfile extends Player {
  birthDate?: string;
  height?: string;
  weight?: string;
  number?: number;
  injured?: boolean;
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

/**
 * 基本的な順位情報
 */
export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
}

// スコア関連の型定義
export interface Score {
  home: number | null;
  away: number | null;
}

// 試合関連の型定義
export interface Competition {
  id: number | string;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

// 基本的な試合ステータス（新規追加）
export interface MatchStatus {
  status: string;
  statusText?: string;
  elapsed?: number;
  finished?: boolean;
  started?: boolean;
}

// 基本的な会場情報（新規追加）
export interface Venue {
  id?: number;
  name: string;
  city: string;
  capacity?: number;
  surface?: string;
  image?: string;
}

// 基本的な試合情報（既存を拡張）
export interface Match {
  id: number | string;
  utcDate: string;
  status: MatchStatus | string; // 後方互換性のため union type
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  competition: Competition;
  venue?:
    | {
        name: string;
        city: string;
      }
    | Venue;
  round?: string;
  matchday?: number;
  // 既存フィールドも保持（後方互換性）
  stage?: string;
  group?: string | null;
  lastUpdated?: string;
  minute?: number;
}

/**
 * ニュース記事の基本情報
 */
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  image?: string;
}
