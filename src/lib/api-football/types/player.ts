/**
 * API-Football 選手データの型定義
 *
 * 選手および選手統計に関する型定義を提供
 */

import { Player, PlayerProfile, BasicPlayerStats, Team, League } from '@/types/type';

/**
 * API-Football 生データの型定義
 */
export interface ApiFootballPlayerRaw {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  height: string;
  weight: string;
  injured: boolean;
  photo: string;
}

export interface ApiFootballPlayer {
  player: ApiFootballPlayerRaw;
  statistics: ApiPlayerStatistics[];
}

export interface ApiPlayerProfile {
  player: ApiFootballPlayerRaw & {
    birth: {
      date?: string;
      place?: string;
      country?: string;
    };
    position: string;
    number?: number;
  };
}

/**
 * API-Football選手統計の生データ
 */
export interface ApiPlayerStatistics {
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
    season: number | string;
  };
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    position: string;
    rating?: string;
    captain: boolean;
  };
  shots?: {
    total?: number;
    on?: number;
  };
  goals: {
    total: number;
    conceded?: number;
    assists?: number;
    saves?: number;
  };
  passes?: {
    total?: number;
    key?: number;
    accuracy?: number;
  };
  tackles?: {
    total?: number;
    blocks?: number;
    interceptions?: number;
  };
  duels?: {
    total?: number;
    won?: number;
  };
  dribbles?: {
    attempts?: number;
    success?: number;
    past?: number;
  };
  fouls?: {
    drawn?: number;
    committed?: number;
  };
  cards: {
    yellow: number;
    yellowred: number;
    red: number;
  };
  penalty?: {
    won?: number;
    commited?: number;
    scored?: number;
    missed?: number;
    saved?: number;
  };
}

/**
 * 移籍・チーム履歴API型
 */
export interface ApiTeamHistoryEntry {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  seasons?: (string | number)[];
}

export interface ApiTransferEntry {
  date: string;
  type: string;
  teams: {
    in: { id: number; name: string; logo: string };
    out: { id: number; name: string; logo: string };
  };
}

/**
 * アプリケーション内部で統一された型
 */
export interface AppPlayer extends PlayerProfile {
  team?: Team;
  stats?: BasicPlayerStats;
}

export interface AppPlayerStats extends BasicPlayerStats {
  team: Team;
  league: League;
}

// 後方互換性のための既存型（段階的に削除予定）
export interface PlayerWithStats extends Player {
  statistics: ApiPlayerStatistics[];
}

export interface PlayerGroup {
  position: string;
  displayName: string;
  players: FormattedPlayer[];
}

export interface FormattedPlayer {
  id: string;
  name: string;
  age?: number;
  position?: string;
  nationality?: string;
  photo?: string;
  team?: {
    id: string;
    name: string;
    logo: string;
  };
}

export interface FormattedPlayerStats extends FormattedPlayer {
  goals: number;
  assists: number;
  appearances: number;
  minutes: number;
  rating?: string;
  cards: {
    yellow: number;
    red: number;
  };
}
