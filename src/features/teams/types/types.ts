/**
 * チーム機能の型定義
 *
 * チーム機能で使用される型を定義
 * ドメイン型とAPI型の間のマッピングもここで定義
 */

import { Team } from '@/types/football';

// チーム詳細情報の型
export interface TeamDetails extends Team {
  founded?: number;
  venue?: string;
  country?: string;
  address?: string;
  website?: string;
  description?: string;
}

// チーム情報取得パラメータの型
export interface TeamInfoParams {
  season?: number | string;
  includeSquad?: boolean;
}

// チーム試合取得パラメータの型
export interface TeamFixturesParams {
  season?: number | string;
  past?: boolean;
  future?: boolean;
  limit?: number;
  forceRefresh?: boolean;
}

// チーム選手取得パラメータの型
export interface TeamPlayersParams {
  season?: number | string;
  forceRefresh?: boolean;
}

/**
 * チーム関連の型定義
 */

// 選手情報の型
export interface TeamPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
  nationality: string;
  height: string | null;
  weight: string | null;
  injured: boolean;
  rating: number | null;
  marketValue: number | null;
}

// ポジション別グループの型
export interface PlayerGroup {
  position: string;
  displayName: string;
  players: TeamPlayer[];
}

// ホーム/アウェイの統計値の型
interface HomeAwayStats {
  home: number;
  away: number;
  total: number;
}

// チーム統計の型
export interface TeamStats {
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
    played: HomeAwayStats;
    wins: HomeAwayStats;
    draws: HomeAwayStats;
    loses: HomeAwayStats;
  };
  goals: {
    for: {
      total: HomeAwayStats;
      average: HomeAwayStats;
    };
    against: {
      total: HomeAwayStats;
      average: HomeAwayStats;
    };
  };
  lineups?: Array<{
    formation: string;
    played: number;
  }>;
  clean_sheet?: HomeAwayStats;
  failed_to_score?: HomeAwayStats;
}
