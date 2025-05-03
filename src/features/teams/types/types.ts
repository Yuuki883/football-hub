/**
 * チーム機能の型定義
 *
 * チーム機能で使用される型を定義
 * ドメイン型とAPI型の間のマッピングもここで定義
 */

import { Team } from '@/types/football';

// チーム詳細情報の型
export interface TeamDetails extends Team {
  founded?: number;
  venue?: string;
  country?: string;
  address?: string;
  website?: string;
  description?: string;
}

// チーム情報取得パラメータの型
export interface TeamInfoParams {
  season?: number | string;
  includeSquad?: boolean;
}

// チーム試合取得パラメータの型
export interface TeamFixturesParams {
  season?: number | string;
  past?: boolean;
  future?: boolean;
  limit?: number;
  forceRefresh?: boolean;
}

// チーム選手取得パラメータの型
export interface TeamPlayersParams {
  season?: number | string;
  forceRefresh?: boolean;
}
