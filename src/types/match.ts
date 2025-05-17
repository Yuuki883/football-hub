/**
 * サッカーの試合に関する型定義
 */

export interface Team {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest: string;
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner: string | null;
    duration: string;
    fullTime: Score;
    halfTime: Score;
    home: number | null;
    away: number | null;
  };
  competition: Competition;
  minute?: number;
}
