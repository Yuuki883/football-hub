/**
 * 選手詳細ページで使用する型定義
 *
 * API-Footballのデータ構造を元に、アプリケーション内で扱いやすい形に変換した型を定義
 */

import { PlayerProfile, BasicPlayerStats, Team } from '@/types/type';
import {
  ApiPlayerProfile,
  ApiPlayerStatistics,
  ApiTeamHistoryEntry,
  ApiTransferEntry,
} from '@/lib/api-football/types/type-exports';

/**
 * 選手詳細ページ用の拡張情報
 */
export interface PlayerDetailInfo extends PlayerProfile {
  // 選手詳細ページ特有の情報があれば追加
}

/**
 * 選手詳細用の統計情報
 */
export interface PlayerDetailStats extends BasicPlayerStats {
  league?: {
    id: number;
    name: string;
    logo: string;
    season?: string;
  };
  // 詳細ページ特有の統計があれば追加
}

/**
 * 移籍履歴エントリ
 */
export interface TransferHistoryEntry {
  team: Team;
  startSeason?: string;
  endSeason?: string;
  isNationalTeam?: boolean;
  transferDate?: string;
  transferType?: string;
  fromTeam?: {
    id: number | string;
    name: string;
    logo: string;
  };
}

/**
 * 選手詳細ページのメインデータ構造
 */
export interface PlayerDetail extends PlayerDetailInfo {
  team?: Team;
  stats: PlayerDetailStats;
  transferHistory: TransferHistoryEntry[];
  teamHistory: TransferHistoryEntry[];
}

// API型の再エクスポート（後方互換性のため）
export type { ApiPlayerProfile, ApiPlayerStatistics, ApiTeamHistoryEntry, ApiTransferEntry };
