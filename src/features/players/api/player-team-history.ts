/**
 * 選手のチーム履歴処理モジュール
 *
 * 選手の所属チーム履歴を処理し、代表チーム、ユースチーム、シニアチームに分類
 */
import { Team } from '@/types/football';
import { isNationalTeam } from './countries-helper';
import { classifyTeam } from '../utils/team-utils';

/**
 * シーズン配列から開始と終了のシーズンを抽出する
 *
 * @param seasons - シーズン番号の配列
 * @returns 開始と終了のシーズン情報
 */
function parseSeasons(seasons: string[] | number[]): {
  startSeason: string;
  endSeason?: string;
} {
  // シーズンがない場合
  if (!seasons || seasons.length === 0) {
    return { startSeason: '' };
  }

  // 数値を文字列に変換して昇順ソート
  const sortedSeasons = [...seasons].map((s) => String(s)).sort();

  // 開始シーズン（配列の最初の要素）
  const startSeason = sortedSeasons.length > 0 ? sortedSeasons[0] : '';

  // 終了シーズン（配列の最後の要素、ただし開始と同じ場合はundefined）
  const endSeason =
    sortedSeasons.length > 1 && sortedSeasons[sortedSeasons.length - 1] !== startSeason
      ? sortedSeasons[sortedSeasons.length - 1]
      : undefined;

  return { startSeason, endSeason };
}

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
      const nationalTeamStatus = await isNationalTeam(teamName);

      // チームを分類
      const { type } = classifyTeam(teamName, teamData, nationalTeamStatus);

      // 履歴エントリを作成
      return {
        team: teamData,
        startSeason,
        endSeason,
        isNationalTeam: type === 'national',
      };
    }) || [];

  // 結果をフィルタリング（nullを除外）
  return (await Promise.all(nationalTeamHistoryPromises)).filter((item) => item !== null);
}
