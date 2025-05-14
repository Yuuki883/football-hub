/**
 * 選手詳細ページで使用する型定義
 *
 * API-Footballのデータ構造を元に、アプリケーション内で扱いやすい形に変換した型を定義
 */

import { Team } from '@/types/football';

// 選手の基本情報
export interface PlayerInfo {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  birthDate?: string;
  nationality: string;
  height?: string;
  weight?: string;
  photo: string;
  position: string;
}

// 所属チーム情報
export interface PlayerTeam {
  team: Team;
  current: boolean;
}

// 選手の統計情報
export interface PlayerStats {
  appearances?: number;
  minutes?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}

// 移籍履歴の各エントリ
export interface TransferHistoryEntry {
  team: Team;
  startSeason: string;
  endSeason?: string;
}

// 選手詳細ページのメインデータ構造
export interface PlayerDetail {
  // 基本情報
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  birthDate?: string;
  nationality: string;
  height?: string;
  weight?: string;
  photo: string;
  position: string;

  // 所属チーム
  team?: Team;

  // 今シーズンの統計
  stats: PlayerStats;

  // 移籍履歴
  transferHistory: TransferHistoryEntry[];
}
