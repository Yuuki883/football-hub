/**
 * 選手統計情報ヘルパーモジュール
 *
 * 選手の統計データを処理し、アプリケーション内で使用しやすい形式に変換する機能
 */
import { ApiPlayerStatistics, LeagueInfo, PlayerStats } from '../types/types';
import { Team } from '@/types/type';
import { formatRating } from '../utils/format-utils';

/**
 * APIから取得した統計データから有効なエントリを見つける
 *
 * @param statistics - APIから取得した統計データ配列
 * @returns 有効な統計データ
 */
export function findValidStats(statistics: ApiPlayerStatistics[]): ApiPlayerStatistics {
  if (!statistics || !statistics.length) {
    return {} as ApiPlayerStatistics;
  }

  // 統計データを順番に確認し、有効なものを採用
  for (const stats of statistics) {
    if (
      stats.games?.appearences ||
      stats.goals?.total ||
      stats.goals?.assists ||
      stats.games?.rating
    ) {
      return stats;
    }
  }

  // 有効なデータが見つからなければ最初のエントリを使用
  return statistics[0] || ({} as ApiPlayerStatistics);
}

/**
 * 統計データからリーグ情報を抽出
 *
 * @param currentStats - 統計データ
 * @returns リーグ情報
 */
export function extractLeagueInfo(currentStats: ApiPlayerStatistics): LeagueInfo | undefined {
  if (!currentStats.league) {
    return undefined;
  }

  return {
    id: currentStats.league.id,
    name: currentStats.league.name,
    logo: currentStats.league.logo,
    season: String(currentStats.league.season),
  };
}

/**
 * 統計データからチーム情報を抽出
 *
 * @param currentStats - 統計データ
 * @returns チーム情報
 */
export function extractTeamInfo(currentStats: ApiPlayerStatistics): Team | undefined {
  if (!currentStats.team) {
    return undefined;
  }

  return {
    id: currentStats.team.id,
    name: currentStats.team.name,
    logo: currentStats.team.logo,
  };
}

/**
 * 統計データから選手統計情報を構築
 *
 * @param currentStats - 統計データ
 * @param leagueInfo - リーグ情報
 * @returns 選手統計情報
 */
export function buildPlayerStats(
  currentStats: ApiPlayerStatistics,
  leagueInfo: LeagueInfo | undefined
): PlayerStats {
  return {
    appearances: currentStats.games?.appearences,
    minutes: currentStats.games?.minutes,
    goals: currentStats.goals?.total,
    assists: currentStats.goals?.assists,
    yellowCards: currentStats.cards?.yellow,
    redCards: currentStats.cards?.red,
    rating: formatRating(currentStats.games?.rating),
    league: leagueInfo,
  };
}

/**
 * 選手の統計情報を変換（メイン関数）
 *
 * @param statistics - APIから取得した統計データ
 * @returns 整形された統計情報とチーム情報
 */
export function transformPlayerStats(statistics: ApiPlayerStatistics[]): {
  stats: PlayerStats;
  currentTeam?: Team;
} {
  // 有効な統計データを探す
  const currentStats = findValidStats(statistics);

  // リーグ情報の抽出
  const leagueInfo = extractLeagueInfo(currentStats);

  // 現在のチーム情報
  const currentTeam = extractTeamInfo(currentStats);

  // 統計情報の構築
  const stats = buildPlayerStats(currentStats, leagueInfo);

  return { stats, currentTeam };
}
