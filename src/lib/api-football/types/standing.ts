/**
 * 順位表に関連する型定義
 *
 * API-Footballの順位表データ構造を定義
 */

/**
 * チームの統計情報
 */
export interface ApiFootballTeamStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

/**
 * API-Footballの順位表データ構造
 */
export interface ApiFootballTeamStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  description: string | null;
  all: ApiFootballTeamStats;
  home: ApiFootballTeamStats;
  away: ApiFootballTeamStats;
  update: string;
}

/**
 * 単一グループの順位表
 */
export type StandingGroup = ApiFootballTeamStanding[];

/**
 * 複数グループがある場合の順位表（CLなど）
 */
export interface GroupedStandings {
  [groupName: string]: StandingGroup;
}

/**
 * アプリケーション内で使用する統一された順位表の型
 */
export interface FormattedStanding {
  position: number;
  team: {
    id: string;
    name: string;
    shortName: string;
    crest: string;
  };
  stats: {
    played: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  };
  form?: string;
  description?: string | null;
}

/**
 * 表示用グループ化された順位表
 */
export interface FormattedStandingGroup {
  groupName: string;
  standings: FormattedStanding[];
}
