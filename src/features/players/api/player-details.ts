/**
 * 選手詳細情報取得API関数
 *
 * 選手の基本情報、今シーズンの統計、所属チーム履歴を取得して統合
 */
import { API_FOOTBALL } from '@/config/api';
import { PlayerDetail } from '../types/types';
import { Team } from '@/types/football';

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
    const [playerInfoResponse, teamsHistoryResponse] = await Promise.all([
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

    // APIからデータがない場合
    if (!playerInfoData.response?.length) {
      console.error('選手データが見つかりません:', playerId);
      return null;
    }

    // 選手情報とシーズン統計の抽出
    const playerData = playerInfoData.response[0];
    const player = playerData.player;
    const currentStats = playerData.statistics?.[0] || {};

    // 現在のチーム情報
    const currentTeam: Team | undefined = currentStats.team
      ? {
          id: currentStats.team.id,
          name: currentStats.team.name,
          logo: currentStats.team.logo,
        }
      : undefined;

    // 移籍履歴の作成
    const transferHistory =
      teamsHistoryData.response?.map((entry: any) => {
        // 各チームの在籍期間からシーズン情報を抽出
        const seasons = entry.statistics?.map((stat: any) => stat.league.season) || [];
        const sortedSeasons = [...seasons].sort();

        return {
          team: {
            id: entry.team.id,
            name: entry.team.name,
            logo: entry.team.logo,
          },
          startSeason: sortedSeasons[0],
          endSeason:
            sortedSeasons[sortedSeasons.length - 1] !== sortedSeasons[0]
              ? sortedSeasons[sortedSeasons.length - 1]
              : undefined,
        };
      }) || [];

    // 選手詳細情報を統合
    const playerDetail: PlayerDetail = {
      // 基本情報
      id: player.id,
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      age: player.age,
      birthDate: player.birth?.date,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      photo: player.photo,
      // API-Footballのレスポンス構造に合わせて修正
      position: player.position || currentStats.games?.position || '不明',

      // 所属チーム
      team: currentTeam,

      // 今シーズンの統計
      stats: {
        appearances: currentStats.games?.appearences,
        minutes: currentStats.games?.minutes,
        goals: currentStats.goals?.total,
        assists: currentStats.goals?.assists,
        yellowCards: currentStats.cards?.yellow,
        redCards: currentStats.cards?.red,
      },

      // 移籍履歴
      transferHistory,
    };

    return playerDetail;
  } catch (error) {
    console.error('選手詳細取得処理エラー:', error);
    return null;
  }
}
