/**
 * チーム機能の型定義
 *
 * このファイルは既存コードとの互換性のために残されています。
 * 新しいコードでは @/types/type からの型インポートを推奨します。
 *
 * @deprecated 共通ドメイン型を直接使用してください
 */

import { Team } from '@/types/type';
import { FormattedStandingGroup } from '@/lib/api-football/types';
import { PlayerProfile } from '@/types/type';

// ホーム/アウェイ統計値
interface HomeAwayStats {
  home: number;
  away: number;
  total: number;
}

// ホーム/アウェイ平均値
interface HomeAwayAverageStats {
  home: number;
  away: number;
  total: number;
}

/**
 * チーム統計情報
 */
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
      average: HomeAwayAverageStats;
    };
    against: {
      total: HomeAwayStats;
      average: HomeAwayAverageStats;
    };
  };
  lineups?: Array<{
    formation: string;
    played: number;
  }>;
  clean_sheet?: HomeAwayStats;
  failed_to_score?: HomeAwayStats;
}

/**
 * チーム試合取得パラメータ
 */
export interface TeamFixturesParams {
  season?: number | string;
  past?: boolean;
  future?: boolean;
  last?: number; // 過去N試合
  next?: number; // 次のN試合
  venue?: 'home' | 'away';
  status?: string;
  limit?: number;
  forceRefresh?: boolean;
}

/**
 * チーム所属リーグ情報
 */
export interface TeamLeagueInfo {
  leagueId?: string;
  leagueName?: string;
  leagueLogo?: string;
  leagueType?: string;
  leagueCountry?: string;
  season?: number;
  teamPosition?: number;
  teamPoints?: number;
}

/**
 * チーム順位情報
 */
export interface TeamStandingInfo {
  teamId: string;
  teamName: string;
  teamLogo: string;
  leagueId: string;
  leagueName: string;
  leagueLogo: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

/**
 * チーム順位取得結果
 */
export interface TeamStandingsResult {
  standings: FormattedStandingGroup[] | null;
  leagueId?: string;
  teamInLeagueData?: TeamStandingInfo;
  metadata?: {
    lastUpdated: string;
    season: number;
  };
}

// 基本的な型エイリアス（後方互換性のため）
/**
 * @deprecated Team型を直接使用してください
 */
export interface TeamDetails extends Team {
  founded?: number;
  venue?: string;
  country?: string;
  address?: string;
  website?: string;
  description?: string;
}

/**
 * チーム基本情報
 */
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

/**
 * チーム所属選手情報
 */
export interface TeamPlayer extends PlayerProfile {
  number?: number;
  position?: string; // PlayerProfileにpositionがない場合のため追加
  injured: boolean;
  rating: number | null;
  marketValue?: number | null;
}

/**
 * ポジション別選手グループ
 */
export interface TeamPlayerGroup {
  position: string;
  displayName: string;
  players: TeamPlayer[];
}
