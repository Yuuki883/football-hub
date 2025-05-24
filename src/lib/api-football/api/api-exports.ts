/**
 * API層 統合エクスポート
 *
 * 各API機能の統合エクスポートを提供
 */

// 試合API
export { getFixtures, getAllMatchesByDate } from './match-data';

// 選手API
export { getLeaguePlayerStats, getTopScorers, getTopAssists, type StatsType } from './player-stats';

// 順位表API
export { getStandings, getStandingsBySlug } from './standings';

// チームAPI
export { getLeagueTeams, getLeagueTeamsBySlug, type FormattedTeam } from './teams';
