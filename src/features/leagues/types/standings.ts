/**
 * リーグ順位表の型定義
 */

import type { Standing, Team } from '@/types/type';

/**
 * リーグ順位表の表示用データ
 */
export interface LeagueStanding extends Standing {
  position: number;
  stats: {
    played: number;
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  form?: string;
  description?: string | null;
  team: Team & {
    shortName?: string;
    crest?: string;
  };
}

/**
 * リーグ順位表のグループ
 */
export interface LeagueStandingGroup {
  groupName: string;
  standings: LeagueStanding[];
}

/**
 * 凡例ラベル用の型定義
 */
export type LegendLabel =
  | 'championsLeague'
  | 'europaLeague'
  | 'conferenceLeague'
  | 'relegation'
  | 'promotion'
  | 'playoff'
  | 'knockout'
  | 'elRelegation'
  | 'eclRelegation'
  | 'elimination';

/**
 * 凡例の表示順序
 */
export type LegendOrder = LegendLabel[];
