/**
 * 試合詳細機能 - 基本試合情報型
 */
import { Match, Team, Competition, Venue } from '@/types/type';

/**
 * 試合詳細ページ用の拡張試合情報
 */
export interface DetailedMatch extends Match {
  referee?: string;
  timezone?: string;
  detailedScore?: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime?: { home: number | null; away: number | null };
    penalty?: { home: number | null; away: number | null };
  };
  periods?: {
    first: number | null;
    second: number | null;
  };
}

/**
 * 試合詳細ページのメインデータ構造
 */
export interface MatchDetail {
  fixture: DetailedMatch;
  hasLineups: boolean;
  hasStatistics: boolean;
  hasEvents: boolean;
}

/**
 * 既存のFixture型（後方互換性のため保持）
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
