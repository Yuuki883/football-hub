import {
  FormattedStandingGroup,
  FormattedStanding,
  ApiFootballTeamStanding,
} from '@/lib/api-football/types/type-exports';
import { withCache } from '@/lib/api-football/client/cache';
import { fetchFromAPI, createUrl } from '@/lib/api-football/total-exports';
import { getTeamDomesticLeague } from './team-leagues';
import { TeamStandingInfo, TeamStandingsResult } from '../types/type';
import { formatStanding } from '@/lib/api-football/utils/data-formatters';

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
                        teamLogo: standing.team.logo,
                        leagueId: leagueId.toString(),
                        leagueName: leagueStandingsData.name || leagueName || '',
                        leagueLogo: leagueStandingsData.logo || leagueLogo || '',
                        position: standing.rank,
                        points: standing.points,
                        played: standing.all.played,
                        wins: standing.all.win,
                        draws: standing.all.draw,
                        losses: standing.all.lose,
                        goalsFor: standing.all.goals.for,
                        goalsAgainst: standing.all.goals.against,
                        goalDifference: standing.goalsDiff,
                        form: standing.form || undefined,
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
                      teamLogo: standing.team.logo,
                      leagueId: leagueId.toString(),
                      leagueName: leagueStandingsData.name || leagueName || '',
                      leagueLogo: leagueStandingsData.logo || leagueLogo || '',
                      position: standing.rank,
                      points: standing.points,
                      played: standing.all.played,
                      wins: standing.all.win,
                      draws: standing.all.draw,
                      losses: standing.all.lose,
                      goalsFor: standing.all.goals.for,
                      goalsAgainst: standing.all.goals.against,
                      goalDifference: standing.goalsDiff,
                      form: standing.form || undefined,
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
