/**
 * 選手詳細情報取得API関数
 *
 * 選手の基本情報、今シーズンの統計、所属チーム履歴を取得して統合
 */
import { API_FOOTBALL } from '@/config/api';
import { PlayerDetail } from '../types/types';
import { Team } from '@/types/football';
import { isNationalTeam } from './countries-helper';

// APIから返される統計情報の型
interface PlayerStats {
  team?: {
    id: number;
    name: string;
    logo: string;
  };
  league?: {
    id: number;
    name: string;
    logo: string;
    season: string;
  };
  games?: {
    appearences?: number;
    minutes?: number;
    position?: string;
    rating?: string;
  };
  goals?: {
    total?: number;
    assists?: number;
  };
  cards?: {
    yellow?: number;
    red?: number;
  };
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

    // 有効な統計データを探す
    let currentStats: PlayerStats = {};
    if (playerData.statistics && playerData.statistics.length > 0) {
      // 統計データを順番に確認し、有効なものを採用
      for (const stats of playerData.statistics) {
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
        currentStats = playerData.statistics[0] || {};
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

    // 代表チーム履歴の作成
    const nationalTeamHistoryPromises =
      teamsHistoryData.response?.map(async (entry: any) => {
        // API-Football v3では直接seasonsが提供されているのでそれを使用
        const seasons = entry.seasons || [];
        // 数値を文字列に変換して昇順ソート
        const sortedSeasons = [...seasons].map((s) => String(s)).sort();

        // 開始と終了のシーズンを設定
        const startSeason = sortedSeasons.length > 0 ? sortedSeasons[0] : '';
        const endSeason =
          sortedSeasons.length > 1 && sortedSeasons[sortedSeasons.length - 1] !== startSeason
            ? sortedSeasons[sortedSeasons.length - 1]
            : undefined;

        // 非同期で代表チーム判定を実行
        const nationalTeamStatus = await isNationalTeam(entry.team.name);

        // 代表チームの場合のみ返す
        if (nationalTeamStatus) {
          return {
            team: {
              id: entry.team.id,
              name: entry.team.name,
              logo: entry.team.logo,
            },
            startSeason,
            endSeason,
            isNationalTeam: true,
          };
        }
        return null;
      }) || [];

    // 代表チームデータのみをフィルタリング（nullを除外）
    const nationalTeamHistory = (await Promise.all(nationalTeamHistoryPromises)).filter(
      (item) => item !== null
    );

    // 移籍履歴データの作成
    let clubTransferHistory: any[] = [];

    if (transfersData.response?.length > 0 && transfersData.response[0].transfers?.length > 0) {
      // 移籍データが存在する場合
      const transfers = transfersData.response[0].transfers;

      // 最新の移籍から順に表示するため逆順にする
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

    // 移籍履歴と代表チーム履歴を結合
    const transferHistory = [...clubTransferHistory, ...nationalTeamHistory];

    // レーティングの整形（"7.866666" -> "7.9"）
    const formatRating = (rating?: string) => {
      if (!rating) return undefined;
      const ratingNum = parseFloat(rating);
      return ratingNum ? ratingNum.toFixed(1) : undefined;
    };

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
        rating: formatRating(currentStats.games?.rating),
        league: leagueInfo,
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
