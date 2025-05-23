/**
 * API-Football 試合データの型定義
 *
 * API-Footballからの試合データをアプリケーション内で使用する統一された形式を定義
 */

// 試合ステータスマッピング
export const MATCH_STATUS_MAPPING: Record<string, string> = {
  FT: '終了',
  HT: 'ハーフタイム',
  NS: '未開始',
  TBD: '日程未定',
  PST: '延期',
  CANC: '中止',
};

// チームの型定義
export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string;
}

// スコアの型定義
export interface Score {
  home: number | null;
  away: number | null;
}

// 大会の型定義
export interface Competition {
  id: string;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

// 試合の型定義
export interface Match {
  id: string;
  utcDate: string;
  status: string;
  statusText?: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  competition: Competition;
  venue?: string;
  matchday?: string;
}

// 日付範囲パラメータの型
export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

// 試合取得パラメータの型
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
