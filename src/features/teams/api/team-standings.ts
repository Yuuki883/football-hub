import { FormattedStandingGroup } from '@/lib/api-football/types';
import { withCache } from '@/lib/api-football/cache';
import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { getTeamDomesticLeague } from './team-leagues';
import { TeamStandingInfo, TeamStandingsResult } from '../types/types';

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
): Promise<TeamStandingsResult> {
  // キャッシュキー
  const cacheKey = `team-standings-${teamId}-${season}`;

  return withCache(
    cacheKey,
    async () => {
      try {
        // チームが所属する国内リーグを特定
        const { leagueId, leagueName, leagueLogo } = await getTeamDomesticLeague(
          teamId,
          season,
          forceRefresh
        );

        if (!leagueId) {
          console.error(`チームの所属リーグが特定できません: teamId=${teamId}, season=${season}`);
          return { standings: null };
        }

        try {
          // 選択したリーグIDで順位表を取得
          const standingsUrl = createUrl('/standings', {
            league: leagueId,
            season,
          });
          const standingsData = await fetchFromAPI(standingsUrl);

          if (!standingsData.response || standingsData.response.length === 0) {
            console.error(`順位表データがありません: leagueId=${leagueId}, season=${season}`);
            return { standings: null, leagueId };
          }

          const leagueStandingsData = standingsData.response[0]?.league;
          if (!leagueStandingsData?.standings) {
            console.error(`リーグ順位表が見つかりません: leagueId=${leagueId}, season=${season}`);
            return { standings: null, leagueId };
          }

          // 順位表データをフォーマット
          let formattedStandings: FormattedStandingGroup[] = [];
          let teamInLeagueData: TeamStandingInfo | undefined = undefined;

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
                        leagueName: leagueStandingsData.name || leagueName || '',
                        leagueLogo: leagueStandingsData.logo || leagueLogo || '',
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
                groupName: leagueStandingsData.name || leagueName || 'League Table',
                standings: leagueStandingsData.standings.map((standing: any) => {
                  const formatted = formatStanding(standing);

                  // チームの順位情報を記録
                  if (standing.team.id.toString() === teamId.toString()) {
                    teamInLeagueData = {
                      teamId: teamId.toString(),
                      teamName: standing.team.name,
                      leagueName: leagueStandingsData.name || leagueName || '',
                      leagueLogo: leagueStandingsData.logo || leagueLogo || '',
                      position: standing.rank,
                    };
                  }

                  return formatted;
                }),
              },
            ];
          }

          return {
            standings: formattedStandings,
            leagueId,
            teamInLeagueData,
          };
        } catch (leagueError) {
          console.error(`リーグ順位表の取得に失敗しました: leagueId=${leagueId}`, leagueError);
          return {
            standings: null,
            leagueId,
          };
        }
      } catch (error) {
        console.error(`チーム順位表の取得に失敗しました: teamId=${teamId}`, error);
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
