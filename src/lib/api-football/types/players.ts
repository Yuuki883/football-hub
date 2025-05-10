/**
 * API-Football 選手データの型定義
 *
 * 選手および選手統計に関する型定義を提供
 */

import { StandingTeam } from './leagues';

// 選手基本情報の型
export interface Player {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  nationality?: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo?: string;
}

export interface PlayerWithStats extends Player {
  statistics: PlayerStatistics[];
}

// ポジショングループの型
export interface PlayerGroup {
  position: string;
  displayName: string;
  players: FormattedPlayer[];
}

// API-Football形式の選手型
export interface ApiFootballPlayer {
  player: {
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
  };
  statistics: PlayerStatistics[];
}

// 選手統計の型
export interface PlayerStatistics {
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
 * アプリで統一された選手データの形式
 */
export interface FormattedPlayer {
  id: string;
  name: string;
  age?: number;
  position?: string;
  nationality?: string;
  photo?: string;
  number?: number;
  team?: {
    id: string;
    name: string;
    logo: string;
  };
}

/**
 * アプリで統一された選手統計情報
 */
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
