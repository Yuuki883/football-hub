/**
 * API-Football リーグデータの型定義
 *
 * リーグおよび順位表関連の型定義を提供
 */

import { League, Country, Season } from '@/types/type';

export interface ApiFootballLeagueData {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

// 変換後の形式
export interface FormattedLeague extends League {
  type: string;
}

export interface FormattedLeagueData {
  league: FormattedLeague;
  country: Country;
  seasons: Season[];
}

// 順位表チームの型
export interface StandingTeam {
  id: number;
  name: string;
  logo: string;
}

// 順位表の型
export interface Standing {
  rank: number;
  team: StandingTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

// 順位表グループの型
export interface StandingsGroup {
  standings: Standing[][];
}
