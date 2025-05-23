/**
 * 試合詳細機能 - イベント関連型
 */

/**
 * 試合イベント情報
 */
export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

/**
 * イベントタイプ定数
 */
export const EVENT_TYPES = {
  GOAL: 'Goal',
  CARD: 'Card',
  SUBSTITUTION: 'subst',
  VAR: 'Var',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * イベント詳細タイプ
 */
export const EVENT_DETAILS = {
  NORMAL_GOAL: 'Normal Goal',
  OWN_GOAL: 'Own Goal',
  PENALTY: 'Penalty',
  YELLOW_CARD: 'Yellow Card',
  RED_CARD: 'Red Card',
  SECOND_YELLOW: 'Second Yellow card',
} as const;

export type EventDetail = (typeof EVENT_DETAILS)[keyof typeof EVENT_DETAILS];

/**
 * 既存のEvent型（後方互換性のため保持）
 */
export interface Event {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}
