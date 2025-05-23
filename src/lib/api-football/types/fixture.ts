/**
 * API-Football 試合データの型定義
 *
 * API-Footballからの試合データをアプリケーション内で使用する統一された形式を定義
 */
import { Match, Team, Competition, Score, MatchStatus, Venue } from '@/types/type';

/**
 * API-Football 生データの型定義
 */
export interface ApiFootballFixtureRaw {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

/**
 * API-Football試合一覧レスポンス
 */
export interface ApiFootballFixturesResponse {
  fixture: ApiFootballFixtureRaw['fixture'];
  league: ApiFootballFixtureRaw['league'];
  teams: ApiFootballFixtureRaw['teams'];
  goals: ApiFootballFixtureRaw['goals'];
  score: ApiFootballFixtureRaw['score'];
}

/**
 * 試合ステータスマッピング
 */
export const MATCH_STATUS_MAPPING: Record<string, string> = {
  FT: '終了',
  HT: 'ハーフタイム',
  NS: '未開始',
  TBD: '日程未定',
  PST: '延期',
  CANC: '中止',
  '1H': '前半',
  '2H': '後半',
  ET: '延長戦',
  PEN: 'PK戦',
  LIVE: 'ライブ',
};

/**
 * アプリケーション内部で統一された型
 */
export interface AppMatch extends Match {
  referee?: string;
  timezone?: string;
  periods?: {
    first: number | null;
    second: number | null;
  };
  winner?: 'home' | 'away' | 'draw' | null;
}

export interface AppFixture extends AppMatch {
  // 試合詳細ページ用の拡張情報
  detailedScore?: {
    halftime: Score;
    fulltime: Score;
    extratime?: Score;
    penalty?: Score;
  };
}

/**
 * 日付範囲パラメータの型
 */
export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

/**
 * 試合取得パラメータの型
 */
export interface FixturesParams {
  teamId?: number | string;
  leagueId?: number | string;
  leagueCode?: string;
  dateFrom?: string;
  dateTo?: string;
  season?: string | number;
  past?: boolean;
  future?: boolean;
  limit?: number;
  forceRefresh?: boolean;
}

// 共通ドメイン型の再エクスポート
export type { Match, Team, Competition, Score, MatchStatus, Venue } from '@/types/type';
