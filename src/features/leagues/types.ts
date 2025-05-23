/**
 * リーグ機能の型定義
 *
 * リーグ関連の機能で使用される型を定義
 */

import { League, Standing, Country } from '@/types/type';

// リーグ詳細情報の型
export interface LeagueDetails extends League {
  country: Country;
  currentSeason?: {
    year: number;
    start: string;
    end: string;
  };
}

// リーグ情報取得パラメータの型
export interface LeagueInfoParams {
  season?: number | string;
}

// リーグの試合取得パラメータの型
export interface LeagueFixturesParams {
  season?: number | string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  forceRefresh?: boolean;
}

// リーグ順位表取得パラメータの型
export interface LeagueStandingsParams {
  season?: number | string;
  forceRefresh?: boolean;
}

// リーグ統計情報取得パラメータの型
export interface LeagueStatsParams {
  season?: number | string;
  category?: 'topscorers' | 'topassists' | 'topreds' | 'topyellows';
  limit?: number;
}
