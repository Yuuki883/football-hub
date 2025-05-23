/**
 * 試合関連のUI表示用型定義
 */
import { DetailedMatch } from './fixture';
import { MatchEvent } from './event';
import { MatchPlayerPerformance } from './statistic';

/**
 * UI表示用の試合情報
 */
export interface UiMatchInfo extends DetailedMatch {
  formattedDate?: string;
  formattedTime?: string;
  statusText?: string;
  isLive?: boolean;
  isFinished?: boolean;
  isUpcoming?: boolean;
}

/**
 * UI表示用のイベント情報
 */
export interface UiMatchEvent extends MatchEvent {
  displayText?: string;
  iconType?: string;
  isImportant?: boolean;
}

/**
 * UI表示用の選手パフォーマンス
 */
export interface UiPlayerPerformance extends MatchPlayerPerformance {
  formattedRating?: string;
  performanceLevel?: 'excellent' | 'good' | 'average' | 'poor';
}

/**
 * カレンダー表示用の試合情報
 */
export interface CalendarMatch {
  id: string;
  date: string;
  time: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
  competition: {
    name: string;
    logo: string;
  };
  status: string;
  score?: {
    home: number;
    away: number;
  };
}

/**
 * 試合カレンダー用のリーグデータ
 */
export interface CalendarLeagueData {
  id: string;
  code: string;
  name: string;
  emblem: string;
  matches: MatchDisplay[];
}

/**
 * 既存のMatchDisplay型（後方互換性のため保持）
 */
export interface MatchDisplay {
  id: string;
  utcDate: string;
  status: string;
  competition: {
    id: string;
    code: string;
    name: string;
    emblem: string;
  };
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
    crest: string;
  };
  score?: {
    home: number | null;
    away: number | null;
  };
}
