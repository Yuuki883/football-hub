/**
 * 選手詳細ページで使用する型定義
 *
 * API-Footballのデータ構造を元に、アプリケーション内で扱いやすい形に変換した型を定義
 */

import { Player, Team, League, BasicStats, ApiResponse } from '@/types/type';
import {
  ApiPlayerProfile,
  ApiPlayerStatistics,
  ApiTeamHistoryEntry,
  ApiTransferEntry,
} from '@/lib/api-football/types/player';

// 選手の基本情報（Player型を拡張）
export interface PlayerInfo extends Player {
  birthDate?: string;
  height?: string;
  weight?: string;
  number?: number;
}

// 所属チーム情報
export interface PlayerTeam {
  team: Team;
  current: boolean;
}

// リーグ情報（League型を拡張）
export interface LeagueInfo extends League {
  season?: string;
}

// 選手の統計情報（BasicStats型を拡張）
export interface PlayerStats extends BasicStats {
  yellowCards?: number;
  redCards?: number;
  rating?: string;
  league?: LeagueInfo;
}

// 移籍履歴の各エントリ
export interface TransferHistoryEntry {
  team: Team;
  startSeason?: string; // optional化
  endSeason?: string;
  isNationalTeam?: boolean; // 代表チームかどうかのフラグ
  transferDate?: string; // 移籍日
  transferType?: string; // 移籍タイプ（Free, Loan, €8.5Mなど）
  fromTeam?: {
    // 移籍元チーム情報
    id: number | string;
    name: string;
    logo: string;
  };
}

// 選手詳細ページのメインデータ構造
export interface PlayerDetail extends PlayerInfo {
  // 所属チーム
  team?: Team;

  // 今シーズンの統計
  stats: PlayerStats;

  // 移籍履歴
  transferHistory: TransferHistoryEntry[];

  // 所属チーム履歴
  teamHistory: TransferHistoryEntry[];
}

// 型のエクスポート（他のモジュールでの利用時の利便性のため）
export type { ApiPlayerProfile, ApiPlayerStatistics, ApiTeamHistoryEntry, ApiTransferEntry };
