/**
 * 試合詳細機能 - 統計・パフォーマンス関連型
 */

/**
 * チーム統計情報
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

/**
 * 既存のStatistics型（後方互換性のため保持）
 */
export interface Statistics {
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
 * 既存のTeamPlayers型（後方互換性のため保持）
 */
export interface TeamPlayers {
  team: {
    id: number;
    name: string;
    logo: string;
    update: string;
  };
  players: MatchPlayerPerformance[];
}
