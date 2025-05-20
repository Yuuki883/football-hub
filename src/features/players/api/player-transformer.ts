/**
 * 選手データの変換処理モジュール
 *
 * API-Footballから取得した生データをアプリケーション内で使用しやすい形式に変換する
 */
import { PlayerStats, TransferHistoryEntry } from '../types/types';
import { Team } from '@/types/football';
import { formatRating } from '../utils/format-utils';

/**
 * 選手の統計情報を変換
 *
 * @param statistics - APIから取得した統計データ
 * @returns 整形された統計情報
 */
export function transformPlayerStats(statistics: any[]): {
  stats: PlayerStats;
  currentTeam?: Team;
} {
  // 有効な統計データを探す
  let currentStats: any = {};

  if (statistics && statistics.length > 0) {
    // 統計データを順番に確認し、有効なものを採用
    for (const stats of statistics) {
      if (
        stats.games?.appearences ||
        stats.goals?.total ||
        stats.goals?.assists ||
        stats.games?.rating
      ) {
        currentStats = stats;
        break;
      }
    }

    // 有効なデータが見つからなければ最初のエントリを使用
    if (Object.keys(currentStats).length === 0) {
      currentStats = statistics[0] || {};
    }
  }

  // リーグ情報の抽出
  const leagueInfo = currentStats.league
    ? {
        id: currentStats.league.id,
        name: currentStats.league.name,
        logo: currentStats.league.logo,
        season: currentStats.league.season,
      }
    : undefined;

  // 現在のチーム情報
  const currentTeam: Team | undefined = currentStats.team
    ? {
        id: currentStats.team.id,
        name: currentStats.team.name,
        logo: currentStats.team.logo,
      }
    : undefined;

  // 統計情報の構築
  const stats: PlayerStats = {
    appearances: currentStats.games?.appearences,
    minutes: currentStats.games?.minutes,
    goals: currentStats.goals?.total,
    assists: currentStats.goals?.assists,
    yellowCards: currentStats.cards?.yellow,
    redCards: currentStats.cards?.red,
    rating: formatRating(currentStats.games?.rating),
    league: leagueInfo,
  };

  return { stats, currentTeam };
}

/**
 * 選手の移籍履歴を変換
 *
 * @param transfersData - 移籍データ
 * @param teamsHistory - チーム履歴データ
 * @returns 整形された移籍履歴
 */
export function transformTransferHistory(
  transfersData: any,
  teamHistoryEntries: any[]
): TransferHistoryEntry[] {
  // 移籍履歴データの作成
  let clubTransferHistory: TransferHistoryEntry[] = [];

  if (transfersData.response?.length > 0 && transfersData.response[0].transfers?.length > 0) {
    // 移籍データが存在する場合
    const transfers = transfersData.response[0].transfers;

    // 移籍情報を変換
    clubTransferHistory = transfers.map((transfer: any) => {
      return {
        team: {
          id: transfer.teams.in.id,
          name: transfer.teams.in.name,
          logo: transfer.teams.in.logo,
        },
        transferDate: transfer.date,
        transferType: transfer.type,
        fromTeam: {
          id: transfer.teams.out.id,
          name: transfer.teams.out.name,
          logo: transfer.teams.out.logo,
        },
        isNationalTeam: false,
      };
    });
  }

  // 代表チームとクラブチーム履歴を分離
  const nationalTeamHistory = teamHistoryEntries.filter((item) => item.isNationalTeam === true);
  const additionalClubHistory = teamHistoryEntries.filter((item) => item.isNationalTeam === false);

  // 移籍履歴とクラブユースチーム履歴、代表チーム履歴を結合
  return [...clubTransferHistory, ...additionalClubHistory, ...nationalTeamHistory];
}
