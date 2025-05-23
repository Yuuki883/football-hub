/**
 * UI表示用の拡張型定義
 *
 * PlayerDetailから派生し、UI表示に特化した属性を追加した型を定義
 */
import { PlayerDetail, PlayerDetailInfo, PlayerDetailStats, TransferHistoryEntry } from './type';
import { TeamType } from '../utils/team-utils';

/**
 * UI表示用の選手基本情報
 * 表示用のフォーマット済み属性を追加
 */
export interface UiPlayerInfo extends PlayerDetailInfo {
  /** フォーマット済み身長（例: "185cm"） */
  formattedHeight?: string;
  /** フォーマット済み体重（例: "80kg"） */
  formattedWeight?: string;
  /** フォーマット済み誕生日（例: "1990年6月15日"） */
  formattedBirthDate?: string;
  /** 年齢を含む表示用名前（例: "山田太郎（25歳）"） */
  displayName?: string;
}

/**
 * UI表示用の選手統計情報
 * パーセンテージや表示用のフォーマット済み値を追加
 */
export interface UiPlayerStats extends PlayerDetailStats {
  /** 試合出場率（％） */
  appearancePercentage?: number;
  /** 試合あたりの得点 */
  goalsPerGame?: string;
  /** 得点効率（分あたり） */
  minutesPerGoal?: string;
}

/**
 * UI表示用の移籍履歴エントリ
 * 表示用の追加情報を含む
 */
export interface UiTransferHistoryEntry extends TransferHistoryEntry {
  /** チーム種別（シニア/ユース/代表） */
  teamType?: TeamType;
  /** 表示用シーズン範囲（例: "2020-2022"） */
  displaySeasons?: string;
  /** 表示用移籍タイプ（例: "無料移籍"、"€8.5M"） */
  displayTransferType?: string;
}

/**
 * UI表示用の選手詳細情報
 * 表示用の拡張情報を含む
 */
export interface UiPlayerDetail extends Omit<PlayerDetail, 'transferHistory'> {
  /** UI表示用の基本情報 */
  uiInfo: UiPlayerInfo;
  /** UI表示用の統計情報 */
  uiStats: UiPlayerStats;
  /** UI表示用の移籍履歴 */
  transferHistory: UiTransferHistoryEntry[];
}
