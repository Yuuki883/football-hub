/**
 * 試合機能の型定義エクスポート
 */

// 基本試合型
export * from './fixture';

// ラインナップ・選手型
export * from './lineup';

// 統計・パフォーマンス型
export * from './statistics';

// イベント型
export * from './event';

// UI型
export * from './ui-type';

// 列挙型・定数型を constants/matches.ts から再エクスポート
export type { MatchStatusType, MatchFilterType } from '../constants/matches';
export { MATCH_STATUS, MATCH_FILTERS } from '../constants/matches';

// 共通ドメイン型の再エクスポート
export type { Match, Team, Competition, Score, MatchStatus, Venue } from '@/types/type';

// API型の再エクスポート
export type {
  AppMatch,
  AppFixture,
  FixturesParams,
  DateRange,
} from '@/lib/api-football/types/fixture';
