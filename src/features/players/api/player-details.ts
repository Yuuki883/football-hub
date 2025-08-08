/**
 * 選手詳細情報取得API関数
 *
 * 選手の基本情報、今シーズンの統計、所属チーム履歴を取得して統合
 */
import { API_FOOTBALL, DEFAULT_SEASON } from '@/config/api';
import { PlayerDetail } from '../types/type';
import { ApiResponse } from '@/types/type';
import { ApiPlayerProfile } from '@/lib/api-football/types/type-exports';
import { processTeamHistory } from './player-team-history';
import { transformTransferHistory } from './player-transfers';
import { transformPlayerStats } from './stats-helper';

/**
 * 選手プロフィール情報を取得
 *
 * @param playerId - 選手ID
 * @returns 選手プロフィール情報
 */
async function getPlayerProfile(playerId: string): Promise<ApiPlayerProfile | null> {
  if (!API_FOOTBALL.KEY) {
    throw new Error('API key is not configured');
  }

  const headers: Record<string, string> = {
    'x-apisports-key': API_FOOTBALL.KEY,
    'Content-Type': 'application/json',
  };

  try {
    // 選手プロフィール情報の取得
    const profileResponse = await fetch(
      `${API_FOOTBALL.BASE_URL}/players/profiles?player=${playerId}`,
      {
        headers,
        next: { revalidate: 3600 * 24 }, // 24時間キャッシュ
      }
    );

    if (!profileResponse.ok) {
      console.error('選手プロフィールAPI取得エラー:', profileResponse.status);
      return null;
    }

    const profileData = (await profileResponse.json()) as ApiResponse<ApiPlayerProfile[]>;

    if (!profileData.response?.length) {
      console.error('選手プロフィールが見つかりません:', playerId);
      return null;
    }

    return profileData.response[0];
  } catch (error) {
    console.error('選手プロフィール取得エラー:', error);
    return null;
  }
}

/**
 * 指定選手の利用可能なシーズン一覧を取得
 *
 * 概要:
 * - API-Footballの players/seasons エンドポイントを用いて、その選手に紐づくシーズン年の配列を取得
 * 制限事項:
 * - 空配列や取得失敗時は null を返す
 *
 * @param playerId 選手ID
 * @returns シーズン年の配列（例: [2025, 2024, ...]）
 */
async function getPlayerAvailableSeasons(playerId: string): Promise<number[] | null> {
  if (!API_FOOTBALL.KEY) {
    throw new Error('API key is not configured');
  }

  const headers: Record<string, string> = {
    'x-apisports-key': API_FOOTBALL.KEY,
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(`${API_FOOTBALL.BASE_URL}/players/seasons?player=${playerId}`, {
      headers,
      next: { revalidate: 3600 * 24 },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { response?: (string | number)[] };
    const seasons = (data.response || []).map((y) => Number(y)).filter((y) => !Number.isNaN(y));
    return seasons.length > 0 ? seasons : null;
  } catch (error) {
    console.error('選手シーズン一覧の取得エラー:', error);
    return null;
  }
}

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
    if (!API_FOOTBALL.KEY) {
      throw new Error('API key is not configured');
    }

    // API呼び出しのためのヘッダー
    const headers: Record<string, string> = {
      'x-apisports-key': API_FOOTBALL.KEY,
      'Content-Type': 'application/json',
    };

    // プロフィール情報を取得
    const profileData = await getPlayerProfile(playerId);

    if (!profileData) {
      return null;
    }

    // 複数のAPIリクエストを並列実行（プロフィール以外）
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
    let playerInfoData = await playerInfoResponse.json();
    const teamsHistoryData = await teamsHistoryResponse.json();
    const transfersData = await transfersResponse.json();

    // APIからデータがない場合は、利用可能な最新シーズンへフォールバック
    if (!playerInfoData.response?.length) {
      const seasons = await getPlayerAvailableSeasons(playerId);
      if (seasons && seasons.length > 0) {
        // 現行デフォルトシーズン以下で直近の年を優先
        const defaultYear = Number(DEFAULT_SEASON);
        const sortedDesc = [...seasons].sort((a, b) => b - a);
        const fallbackYear = sortedDesc.find((y) => y <= defaultYear) ?? sortedDesc[0];

        if (fallbackYear && String(fallbackYear) !== season) {
          const fallbackRes = await fetch(
            `${API_FOOTBALL.BASE_URL}/players?id=${playerId}&season=${fallbackYear}`,
            { headers, next: { revalidate: 3600 } }
          );
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData?.response?.length) {
              playerInfoData = fallbackData;
            }
          }
        }
      }

      // それでも無ければ null を返却
      if (!playerInfoData.response?.length) {
        console.error('選手データが見つかりません:', playerId, '(season:', season, ')');
        return null;
      }
    }

    // 選手情報の抽出
    const playerData = playerInfoData.response[0];

    // プロフィールからの詳細情報
    const profilePlayer = profileData.player;

    // 統計情報を変換し、現在のチーム情報も取得
    const { stats, currentTeam } = transformPlayerStats(playerData.statistics || []);

    // チーム履歴データを処理
    const teamHistory = await processTeamHistory(teamsHistoryData);

    // 移籍履歴を処理
    const transferHistory = transformTransferHistory(transfersData);

    // 選手詳細情報を統合
    const playerDetail: PlayerDetail = {
      // プロフィールAPIからの基本情報
      id: profilePlayer.id,
      name: profilePlayer.name,
      firstName: profilePlayer.firstname,
      lastName: profilePlayer.lastname,
      age: profilePlayer.age,
      birthDate: profilePlayer.birth?.date,
      nationality: profilePlayer.nationality,
      height: profilePlayer.height,
      weight: profilePlayer.weight,
      photo: profilePlayer.photo,
      position: profilePlayer.position,
      number: profilePlayer.number,

      // 所属チーム
      team: currentTeam,

      // 今シーズンの統計
      stats,

      // 移籍履歴
      transferHistory,

      // 所属チーム履歴
      teamHistory,
    };

    return playerDetail;
  } catch (error) {
    console.error('選手詳細取得処理エラー:', error);
    return null;
  }
}
