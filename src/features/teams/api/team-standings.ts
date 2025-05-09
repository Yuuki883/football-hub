import { FormattedStandingGroup } from '@/lib/api-football/types';
import { withCache } from '@/lib/api-football/cache';
import { fetchFromAPI, createUrl } from '@/lib/api-football/index';

/**
 * チームが所属するリーグの順位表を取得
 *
 * チームIDとシーズンを指定して、そのチームの所属リーグを検索し、順位表を取得する
 * キャッシュ機構を利用して重複リクエストを最小化
 *
 * @param teamId チームID
 * @param season シーズン（年度）
 * @param forceRefresh キャッシュを無視して強制的に最新データを取得する場合はtrue
 * @returns 順位表データとリーグID
 */
export async function getTeamStandings(
  teamId: string | number,
  season: string | number,
  forceRefresh: boolean = false
): Promise<{
  standings: FormattedStandingGroup[] | null;
  leagueId?: string;
  teamInLeagueData?: {
    teamId: string;
    teamName: string;
    leagueName: string;
    leagueLogo: string;
    position: number;
  };
}> {
  // キャッシュキー
  const cacheKey = `team-standings-${teamId}-${season}`;

  return withCache(
    cacheKey,
    async () => {
      try {
        // 1. チームが参加している大会一覧を取得
        console.log(`チームの大会一覧取得: teamId=${teamId}, season=${season}`);
        const leaguesUrl = createUrl('/leagues', { team: teamId, season });
        const leaguesData = await fetchFromAPI(leaguesUrl);

        if (!leaguesData.response || leaguesData.response.length === 0) {
          console.error(
            `チームの参加大会データがありません: teamId=${teamId}, season=${season}`
          );
          return { standings: null };
        }

        // 2. リーグタイプの大会を優先して選択
        let selectedLeague = null;

        // まず "League" タイプの大会を探す
        for (const leagueData of leaguesData.response) {
          if (leagueData.league && leagueData.league.type === 'League') {
            selectedLeague = leagueData.league;
            console.log(
              `国内リーグを選択: ${selectedLeague.name} (${selectedLeague.id})`
            );
            break;
          }
        }

        // "League" タイプがない場合は最初の大会を使用
        if (!selectedLeague && leaguesData.response.length > 0) {
          selectedLeague = leaguesData.response[0].league;
          console.log(
            `国内リーグが見つからないため他の大会を選択: ${selectedLeague.name} (${selectedLeague.id})`
          );
        }

        if (!selectedLeague) {
          console.error(
            `有効な大会が見つかりません: teamId=${teamId}, season=${season}`
          );
          return { standings: null };
        }

        const leagueId = selectedLeague.id;
        const leagueLogo = selectedLeague.logo;

        try {
          // 3. 選択したリーグIDで順位表を取得
          console.log(`順位表取得: leagueId=${leagueId}, season=${season}`);
          const standingsUrl = createUrl('/standings', {
            league: leagueId,
            season,
          });
          const standingsData = await fetchFromAPI(standingsUrl);

          if (!standingsData.response || standingsData.response.length === 0) {
            console.error(
              `順位表データがありません: leagueId=${leagueId}, season=${season}`
            );
            return { standings: null, leagueId: leagueId.toString() };
          }

          const leagueStandingsData = standingsData.response[0]?.league;
          if (!leagueStandingsData?.standings) {
            console.error(
              `リーグ順位表が見つかりません: leagueId=${leagueId}, season=${season}`
            );
            return { standings: null, leagueId: leagueId.toString() };
          }

          // 4. 順位表データをフォーマット
          let formattedStandings: FormattedStandingGroup[] = [];
          let teamInLeagueData = undefined;

          // グループ化された順位表か判断
          const isMultiGroup = Array.isArray(leagueStandingsData.standings[0]);

          if (isMultiGroup) {
            // 複数グループの場合（Champions Leagueなど）
            formattedStandings = leagueStandingsData.standings.map(
              (group: any[], index: number) => {
                let groupName = `Group ${String.fromCharCode(65 + index)}`; // Group A, B, C...

                // グループ名がデータに含まれている場合はそれを使用
                if (group.length > 0 && group[0].group) {
                  groupName = group[0].group;
                }

                const formattedGroup = {
                  groupName,
                  standings: group.map((standing) => {
                    const formatted = formatStanding(standing);

                    // チームの順位情報を記録
                    if (standing.team.id.toString() === teamId.toString()) {
                      teamInLeagueData = {
                        teamId: teamId.toString(),
                        teamName: standing.team.name,
                        leagueName: leagueStandingsData.name,
                        leagueLogo: leagueStandingsData.logo || leagueLogo,
                        position: standing.rank,
                      };
                    }

                    return formatted;
                  }),
                };

                return formattedGroup;
              }
            );
          } else {
            // 単一グループの場合（通常のリーグ）
            formattedStandings = [
              {
                groupName: leagueStandingsData.name || 'League Table',
                standings: leagueStandingsData.standings.map(
                  (standing: any) => {
                    const formatted = formatStanding(standing);

                    // チームの順位情報を記録
                    if (standing.team.id.toString() === teamId.toString()) {
                      teamInLeagueData = {
                        teamId: teamId.toString(),
                        teamName: standing.team.name,
                        leagueName: leagueStandingsData.name,
                        leagueLogo: leagueStandingsData.logo || leagueLogo,
                        position: standing.rank,
                      };
                    }

                    return formatted;
                  }
                ),
              },
            ];
          }

          return {
            standings: formattedStandings,
            leagueId: leagueId.toString(),
            teamInLeagueData,
          };
        } catch (leagueError) {
          console.error(
            `リーグ順位表の取得に失敗しました: leagueId=${leagueId}`,
            leagueError
          );
          return {
            standings: null,
            leagueId: leagueId.toString(),
          };
        }
      } catch (error) {
        console.error(
          `チーム順位表の取得に失敗しました: teamId=${teamId}`,
          error
        );
        return { standings: null };
      }
    },
    3600, // 1時間キャッシュ
    forceRefresh
  );
}

/**
 * チーム順位データをアプリ内で統一された形式に変換
 *
 * @param standing API-Footballから返されるチーム順位データ
 * @returns 変換後のデータ
 */
function formatStanding(standing: any): any {
  return {
    position: standing.rank,
    team: {
      id: standing.team.id.toString(),
      name: standing.team.name,
      shortName: standing.team.name,
      crest: standing.team.logo,
    },
    playedGames: standing.all.played,
    won: standing.all.win,
    draw: standing.all.draw,
    lost: standing.all.lose,
    points: standing.points,
    goalsFor: standing.all.goals.for,
    goalsAgainst: standing.all.goals.against,
    goalDifference: standing.goalsDiff,
    form: standing.form || undefined,
    description: standing.description,
  };
}
