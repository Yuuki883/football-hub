/**
 * 試合詳細機能で使用する型定義
 */

/**
 * チーム情報の型定義
 */
export interface Team {
  id: number;
  name: string;
  logo: string;
}

/**
 * 試合基本情報の型定義
 */
export interface Fixture {
  id: number;
  date: string;
  status: {
    long: string;
    short: string;
    elapsed?: number;
  };
  league: {
    name: string;
    round: string;
    logo: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  venue: {
    name: string;
    city: string;
  };
}

/**
 * 試合統計情報の型定義
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
 * 試合機能で使用する選手関連型定義
 */
import { Player, BasicPlayerStats } from '@/types/type';

/**
 * 試合での選手基本情報
 */
export interface MatchPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

/**
 * ラインナップ内の選手エントリー
 */
export interface MatchPlayerEntry {
  player: MatchPlayer;
}

/**
 * チーム編成情報の型定義
 */
export interface Lineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  coach?: {
    id: number;
    name: string;
    photo: string;
  };
  formation: string;
  startXI: MatchPlayerEntry[];
  substitutes: MatchPlayerEntry[];
}

/**
 * イベント情報の型定義
 */
export interface Event {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

/**
 * APIレスポンスの型定義
 */
export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

/**
 * 試合での選手統計情報
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
 * 試合での選手パフォーマンス
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
 * チーム選手データの型定義
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

/**
 * Football-Data APIの試合表示用の型定義
 */
export interface MatchDisplay {
  id: string;
  utcDate: string;
  status: string;
  competition: {
    id: string;
    code: string;
    name: string;
    emblem: string;
  };
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  score?: {
    home: number | null;
    away: number | null;
  };
}

/**
 * 試合カレンダー用のリーグデータ型定義
 */
export interface CalendarLeagueData {
  id: string;
  code: string;
  name: string;
  emblem: string;
  matches: MatchDisplay[];
}

/**
 * 試合ステータスの型定義（定数）
 */
export const MatchStatus = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
} as const;

export type MatchStatusType = (typeof MatchStatus)[keyof typeof MatchStatus];
