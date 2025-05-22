/**
 * 選手のチーム履歴処理モジュール
 *
 * 選手の所属チーム履歴を処理し、代表チーム、ユースチーム、シニアチームに分類
 */
import { Team } from '@/types/football';
import { isNationalTeam } from './team-helper';
import { classifyTeam } from '../utils/team-utils';
import { parseSeasons } from '../utils/data-parser';

/**
 * APIから取得したチーム履歴データを処理
 *
 * @param teamsHistoryData - APIから取得したチーム履歴データ
 * @returns 処理済みのチーム履歴エントリ
 */
export async function processTeamHistory(teamsHistoryData: any): Promise<any[]> {
  // チーム履歴がない場合
  if (!teamsHistoryData.response || !teamsHistoryData.response.length) {
    return [];
  }

  // チーム履歴の各エントリについて処理
  const nationalTeamHistoryPromises =
    teamsHistoryData.response?.map(async (entry: any) => {
      // チーム名を取得
      const teamName = entry.team.name;

      // API-Football v3では直接seasonsが提供されているのでそれを使用
      const seasons = entry.seasons || [];

      // シーズン情報の解析
      const { startSeason, endSeason } = parseSeasons(seasons);

      // チームの基本情報
      const teamData: Team = {
        id: entry.team.id,
        name: entry.team.name,
        logo: entry.team.logo,
      };

      // 非同期で代表チーム判定を実行
      const isTeamNational = await isNationalTeam(teamName);

      // チームを分類
      const { type } = classifyTeam(teamName, teamData, isTeamNational);

      const isNationalFlag = type === 'national';

      // 履歴エントリを作成
      return {
        team: teamData,
        startSeason,
        endSeason,
        isNationalTeam: isNationalFlag,
      };
    }) || [];

  // 結果をフィルタリング（nullを除外）
  return (await Promise.all(nationalTeamHistoryPromises)).filter((item) => item !== null);
}
