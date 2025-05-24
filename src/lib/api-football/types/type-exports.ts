/**
 * API-Football 型定義のエクスポート
 *
 * すべての型定義を一箇所から集中的にエクスポート
 * インポート側は統一的にこのindex.tsから型を取得
 */

// 共通ドメイン型の再エクスポート（新規追加）
export type {
  Player,
  PlayerProfile,
  BasicPlayerStats,
  Team,
  TeamDetail,
  TeamVenue,
  TeamType,
  ClassifiedTeam,
  League,
  Country,
  Competition,
  Match,
  Score,
  MatchStatus,
  Venue,
  ApiResponse,
} from '@/types/type';

// 既存の個別型エクスポート
export * from './common';
export * from './fixture';
export * from './league';
export * from './player';
export * from './standing';
export * from './team';
