/**
 * 試合詳細機能で使用する定数定義
 */

import { Goal, AlertTriangle, ArrowRightLeft } from 'lucide-react';

// MatchLayout: タブリスト定義
export const TABS = [
  { id: 'stats', label: 'スタッツ' },
  { id: 'lineups', label: 'ラインナップ' },
  { id: 'events', label: 'イベント' },
];

// EventsPanel: イベントフィルターオプション
export const EVENT_FILTERS = [
  { id: 'all', label: 'すべて', icon: null, activeClass: 'bg-blue-600 text-white' },
  {
    id: 'goals',
    label: 'ゴール',
    icon: Goal,
    activeClass: 'bg-green-600 text-white',
  },
  {
    id: 'cards',
    label: 'カード',
    icon: AlertTriangle,
    activeClass: 'bg-yellow-500 text-white',
  },
  {
    id: 'subs',
    label: '交代',
    icon: ArrowRightLeft,
    activeClass: 'bg-purple-600 text-white',
  },
];

// StatsPanel: 統計項目の日本語表示名
export const STAT_LABELS: Record<string, string> = {
  'Ball Possession': 'ボール支配率',
  'Total Shots': 'シュート数',
  'Shots on Goal': '枠内シュート',
  'Shots off Goal': '枠外シュート',
  'Blocked Shots': 'ブロックされたシュート',
  'Shots insidebox': '枠内シュート',
  'Shots outsidebox': '枠外シュート',
  'Corner Kicks': 'コーナーキック',
  Offsides: 'オフサイド',
  Fouls: 'ファウル',
  'Yellow Cards': 'イエローカード',
  'Red Cards': 'レッドカード',
  'Goalkeeper Saves': 'セーブ数',
  'Total passes': '総パス数',
  'Passes accurate': '成功パス数',
  'Passes %': 'パス成功率',
  expected_goals: 'ゴール期待値(xG)',
};

// StatsPanel: 統計カテゴリごとのグループ化と表示順序
export const STAT_CATEGORIES = {
  ボール支配: ['Ball Possession', 'Total passes', 'Passes accurate', 'Passes %'],
  シュート: [
    'Total Shots',
    'Shots on Goal',
    'Shots off Goal',
    'Blocked Shots',
    'Shots insidebox',
    'Shots outsidebox',
  ],
  セットプレー: ['Corner Kicks', 'Offsides'],
  'ファウル&カード': ['Fouls', 'Yellow Cards', 'Red Cards'],
  GK: ['Goalkeeper Saves'],
  ゴール期待値: ['expected_goals'],
};

// StatsPanel: カテゴリ表示用のカラー
export const CATEGORY_COLORS = {
  ボール支配: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200',
  シュート: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200',
  セットプレー: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200',
  'ファウル&カード':
    'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200',
  GK: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200',
  ゴール期待値: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 border-pink-200',
  その他: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200',
};

// LineupPanel: チームカラー定義
export const TEAM_COLORS = {
  home: 'blue',
  away: 'red',
};

// イベントタイプに応じたテキスト変換
export const EVENT_TEXT_MAP = {
  Goal: {
    'Normal Goal': 'ゴール',
    'Own Goal': 'オウンゴール',
    Penalty: 'ペナルティゴール',
    default: 'ゴール',
  },
  Card: {
    'Yellow Card': 'イエローカード',
    'Red Card': 'レッドカード',
    'Second Yellow card': 'イエローカード（2枚目）',
    default: 'カード',
  },
  subst: '選手交代',
  Var: 'VAR判定',
};

// =============================================================================
// 試合機能で使用する定数と列挙型
// =============================================================================

/**
 * 試合ステータス定数
 */
export const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
} as const;

export type MatchStatusType = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

/**
 * 試合フィルター定数
 */
export const MATCH_FILTERS = {
  ALL: 'all',
  LIVE: 'live',
  TODAY: 'today',
  UPCOMING: 'upcoming',
  FINISHED: 'finished',
} as const;

export type MatchFilterType = (typeof MATCH_FILTERS)[keyof typeof MATCH_FILTERS];

/**
 * 既存のMatchStatus定数（後方互換性のため保持）
 */
export const MatchStatus = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
} as const;
