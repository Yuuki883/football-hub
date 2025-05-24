/**
 * 試合詳細機能 - 統計・パフォーマンス関連型
 */

// 統一されたチーム型を使用
import type { Team } from '@/types/type';

/**
 * チーム統計情報
 * 統一されたTeam型を基盤として使用
 */
export interface MatchTeamStatistics {
  team: {
    id: number;
    name: string;
  };
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

/**
 * 選手の試合統計情報
 */
export interface MatchPlayerStatistics {
  games: {
    minutes: number | null;
    number: number;
    position: string;
    rating: string | null;
    captain: boolean;
    substitute: boolean;
  };
  offsides: number | null;
  shots: {
    total: number | null;
    on: number | null;
  };
  goals: {
    total: number | null;
    conceded: number | null;
    assists: number | null;
    saves: number | null;
  };
  passes: {
    total: number | null;
    key: number | null;
    accuracy: string | null;
  };
  tackles: {
    total: number | null;
    blocks: number | null;
    interceptions: number | null;
  };
  duels: {
    total: number | null;
    won: number | null;
  };
  dribbles: {
    attempts: number | null;
    success: number | null;
    past: number | null;
  };
  fouls: {
    drawn: number | null;
    committed: number | null;
  };
  cards: {
    yellow: number | null;
    red: number | null;
  };
  penalty: {
    won: number | null;
    commited: number | null;
    scored: number | null;
    missed: number | null;
    saved: number | null;
  };
}

/**
 * 選手の試合パフォーマンス
 */
export interface MatchPlayerPerformance {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: MatchPlayerStatistics[];
}

/**
 * チーム選手データ
 * 統一されたTeam型の構造に準拠
 */
export interface MatchTeamPlayers {
  team: {
    id: number;
    name: string;
    logo: string;
    update: string;
  };
  players: MatchPlayerPerformance[];
}
