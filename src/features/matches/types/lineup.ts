/**
 * 試合詳細機能 - ラインナップ・選手関連型
 */
import { Player } from '@/types/type';

/**
 * 試合での選手基本情報
 */
export interface MatchPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

/**
 * ラインナップ内の選手エントリー
 */
export interface MatchPlayerEntry {
  player: MatchPlayer;
}

/**
 * コーチ情報
 */
export interface MatchCoach {
  id: number;
  name: string;
  photo?: string;
}

/**
 * チーム編成情報
 */
export interface MatchLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  coach?: MatchCoach;
  formation: string;
  startXI: MatchPlayerEntry[];
  substitutes: MatchPlayerEntry[];
}

/**
 * 既存のLineup型（後方互換性のため保持）
 */
export interface Lineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  coach?: {
    id: number;
    name: string;
    photo: string;
  };
  formation: string;
  startXI: MatchPlayerEntry[];
  substitutes: MatchPlayerEntry[];
}
