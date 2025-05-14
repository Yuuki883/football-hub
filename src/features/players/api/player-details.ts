/**
 * 選手詳細情報取得API関数
 *
 * 選手の基本情報、今シーズンの統計、所属チーム履歴を取得して統合
 */
import { API_FOOTBALL } from '@/config/api';
import { PlayerDetail } from '../types/types';
import { transformPlayerBasicInfo, transformPlayerStats } from './player-transformer';
import { processTeamHistory } from './player-team-history';
import { extractTransferHistory } from './player-transfers';
import { transformTransferHistory } from './player-transformer';

/**
 * 選手詳細情報を取得
 *
 * @param playerId - 選手ID
 * @param season - シーズン（例: '2024'）
 * @returns 統合された選手詳細情報
 */
export async function getPlayerDetails(
  playerId: string,
  season: string
): Promise<PlayerDetail | null> {
  try {
    // API呼び出しのためのヘッダー
    const headers = {
      'x-rapidapi-key': API_FOOTBALL.KEY,
      'x-rapidapi-host': API_FOOTBALL.HOST,
    };

    // 複数のAPIリクエストを並列実行
    const [playerInfoResponse, teamsHistoryResponse, transfersResponse] = await Promise.all([
      // 選手基本情報とシーズン統計
      fetch(`${API_FOOTBALL.BASE_URL}/players?id=${playerId}&season=${season}`, {
        headers,
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }),
      // 選手の所属チーム履歴
      fetch(`${API_FOOTBALL.BASE_URL}/players/teams?player=${playerId}`, {
        headers,
        next: { revalidate: 3600 * 24 }, // 24時間キャッシュ
      }),
      // 選手の移籍情報
      fetch(`${API_FOOTBALL.BASE_URL}/transfers?player=${playerId}`, {
        headers,
        next: { revalidate: 3600 * 24 }, // 24時間キャッシュ
      }),
    ]);

    // レスポンスチェック
    if (!playerInfoResponse.ok || !teamsHistoryResponse.ok) {
      console.error(
        '選手データAPI取得エラー:',
        playerInfoResponse.status,
        teamsHistoryResponse.status
      );
      return null;
    }

    // APIレスポンス解析
    const playerInfoData = await playerInfoResponse.json();
    const teamsHistoryData = await teamsHistoryResponse.json();
    const transfersData = await transfersResponse.json();

    // APIからデータがない場合
    if (!playerInfoData.response?.length) {
      console.error('選手データが見つかりません:', playerId);
      return null;
    }

    // 選手情報の抽出
    const playerData = playerInfoData.response[0];
    const player = playerData.player;

    // 選手の基本情報を変換
    const playerInfo = transformPlayerBasicInfo(player);

    // 統計情報を変換し、現在のチーム情報も取得
    const { stats, currentTeam } = transformPlayerStats(playerData.statistics || []);

    // チーム履歴データを処理
    const teamHistoryEntries = await processTeamHistory(teamsHistoryData);

    // 移籍履歴を処理
    const transferHistory = transformTransferHistory(transfersData, teamHistoryEntries);

    // 選手詳細情報を統合
    const playerDetail: PlayerDetail = {
      // 基本情報
      ...playerInfo,

      // 所属チーム
      team: currentTeam,

      // 今シーズンの統計
      stats,

      // 移籍履歴
      transferHistory,
    };

    return playerDetail;
  } catch (error) {
    console.error('選手詳細取得処理エラー:', error);
    return null;
  }
}
