/**
 * チーム所属リーグAPI
 *
 * チームが所属するリーグを特定する機能を提供
 */
import { fetchFromAPI, createUrl } from '@/lib/api-football/api-football';
import { withCache } from '@/lib/api-football/client/cache';
import { TeamLeagueInfo } from '../types/type';

/**
 * チームと所属リーグの情報を並行して取得する最適化関数
 *
 * 内部使用の最適化関数：チーム情報とリーグ情報を同時に取得
 *
 * @param teamId チームID
 * @param season シーズン（年度）
 * @returns チーム情報とリーグ情報をまとめたオブジェクト
 */
async function fetchTeamWithLeagues(
  teamId: string | number,
  season: string | number
): Promise<{
  teamData: any;
  leaguesData: any;
}> {
  try {
    // チーム情報とリーグ情報を並行して取得
    const [teamData, leaguesData] = await Promise.all([
      fetchFromAPI(createUrl('/teams', { id: teamId })),
      fetchFromAPI(createUrl('/leagues', { team: teamId, season })),
    ]);

    return { teamData, leaguesData };
  } catch (error) {
    console.error(`チームとリーグ情報の取得に失敗: teamId=${teamId}`, error);
    throw error;
  }
}

/**
 * チームが所属する国内リーグを特定する
 *
 * 指定されたチームIDとシーズンから、そのチームが所属する国内リーグを優先的に特定する
 * 最適化：チーム情報とリーグ情報を並行して取得し、効率的にキャッシュ
 *
 * @param teamId チームID
 * @param season シーズン（年度）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @returns リーグID、リーグ名、リーグロゴなどの情報
 */
export async function getTeamDomesticLeague(
  teamId: string | number,
  season: string | number,
  forceRefresh: boolean = false
): Promise<TeamLeagueInfo> {
  // キャッシュキー
  const cacheKey = `team-domestic-league-${teamId}-${season}`;

  return withCache(
    cacheKey,
    async () => {
      try {
        // チーム情報とリーグ情報を並行して取得（API呼び出しを最適化）
        const { teamData, leaguesData } = await fetchTeamWithLeagues(teamId, season);

        // チーム情報の検証
        if (!teamData.response || teamData.response.length === 0) {
          console.error(`チーム情報が取得できませんでした: teamId=${teamId}`);
          return {};
        }

        // リーグ情報の検証
        if (!leaguesData.response || leaguesData.response.length === 0) {
          console.error(`チームの参加大会データがありません: teamId=${teamId}, season=${season}`);
          return {};
        }

        // チームの国情報を取得
        const teamCountry = teamData.response[0]?.team?.country || null;

        // 国内リーグを優先的に選択
        let selectedLeague = null;

        // 選択ロジック1: チームと同じ国の国内リーグを探す（タイプが'League'のもの）
        if (teamCountry) {
          for (const leagueData of leaguesData.response) {
            if (
              leagueData.league &&
              leagueData.league.type === 'League' &&
              leagueData.country &&
              leagueData.country.name === teamCountry
            ) {
              selectedLeague = leagueData.league;
              break;
            }
          }
        }

        // 選択ロジック2: 同じ国のリーグが見つからない場合は、タイプが'League'の最初のリーグを使用
        if (!selectedLeague) {
          for (const leagueData of leaguesData.response) {
            if (leagueData.league && leagueData.league.type === 'League') {
              selectedLeague = leagueData.league;
              break;
            }
          }
        }

        // 選択ロジック3: それでも見つからない場合は最初の大会を使用
        if (!selectedLeague && leaguesData.response.length > 0) {
          selectedLeague = leaguesData.response[0].league;
        }

        if (!selectedLeague) {
          console.error(`有効な大会が見つかりません: teamId=${teamId}, season=${season}`);
          return {};
        }

        return {
          leagueId: selectedLeague.id.toString(),
          leagueName: selectedLeague.name,
          leagueLogo: selectedLeague.logo,
          leagueType: selectedLeague.type,
          leagueCountry: teamCountry,
        };
      } catch (error) {
        console.error(`チーム所属リーグの取得に失敗しました: teamId=${teamId}`, error);
        return {};
      }
    },
    3600, // 1時間キャッシュ
    forceRefresh
  );
}
