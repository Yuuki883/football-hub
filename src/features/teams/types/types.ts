/**
 * チーム機能の型定義
 *
 * チーム機能で使用される型を定義
 * ドメイン型とAPI型の間のマッピングもここで定義
 */

import { Team } from '@/types/type';
import { FormattedStandingGroup } from '@/lib/api-football/types';
import { PlayerProfile } from '@/types/type';

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

// チーム基本情報の戻り値型
export interface TeamInfo {
  team: {
    id: number;
    name: string;
    code?: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
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
 * チーム所属リーグ情報の型
 */
export interface TeamLeagueInfo {
  leagueId?: string;
  leagueName?: string;
  leagueLogo?: string;
  leagueType?: string;
  leagueCountry?: string;
}

/**
 * チーム順位情報の型
 */
export interface TeamStandingInfo {
  teamId: string;
  teamName: string;
  leagueName: string;
  leagueLogo: string;
  position: number;
}

/**
 * 順位表取得結果の型
 */
export interface TeamStandingsResult {
  standings: FormattedStandingGroup[] | null;
  leagueId?: string;
  teamInLeagueData?: TeamStandingInfo;
}

/**
 * チーム関連の型定義
 */

/**
 * チーム所属選手情報
 */
export interface TeamPlayer extends PlayerProfile {
  number: number | undefined;
  injured: boolean;
  rating: number | null;
  marketValue: number | null;
}

/**
 * チーム選手のポジション別グループ
 */
export interface TeamPlayerGroup {
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
