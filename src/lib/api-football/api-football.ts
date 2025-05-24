/**
 * API-Football 統合エントリポイント
 *
 */

// 基盤機能（client層）
export { fetchFromAPI, createUrl } from './client/index';
export { withCache, createCacheKey } from './client/cache';

// API機能（api層）
export {
  getFixtures,
  getAllMatchesByDate,
  getLeaguePlayerStats,
  getTopScorers,
  getTopAssists,
  getStandings,
  getStandingsBySlug,
  getLeagueTeams,
  getLeagueTeamsBySlug,
  type StatsType,
  type FormattedTeam,
} from './api/api-exports';

// ユーティリティ機能（utils層）
export {
  formatMatches,
  formatMatch,
  DEFAULT_SEASON,
  calculateDateRange,
  MATCH_STATUS_MAPPING,
  getCountryNames,
  type Match,
} from './utils/utils-exports';

// 型定義（types層）
export type { FormattedPlayerStats, PlayerWithStats, ApiFootballPlayer } from './types/player';
export type {
  FormattedStandingGroup,
  FormattedStanding,
  ApiFootballTeamStanding,
} from './types/standing';
export type { ApiFootballTeamDetailRaw } from './types/team';
