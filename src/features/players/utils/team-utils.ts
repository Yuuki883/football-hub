/**
 * チーム情報処理ユーティリティ
 *
 * チームの種別判定や整形処理のための関数群
 */
import { Team } from '@/types/football';

/**
 * チーム種別の定義
 */
export type TeamType = 'senior' | 'youth' | 'national';

/**
 * チーム情報の分類結果
 */
export interface ClassifiedTeam {
  type: TeamType;
  teamData: Team;
}

/**
 * チームを種別（シニアチーム、ユースチーム、代表チーム）に分類する
 *
 * @param teamName - チーム名
 * @param teamData - チーム基本情報
 * @param isNationalTeam - 代表チームフラグ
 * @returns 分類されたチーム情報
 */
export function classifyTeam(
  teamName: string,
  teamData: Team,
  isNationalTeam: boolean
): ClassifiedTeam {
  // 代表チームの場合
  if (isNationalTeam) {
    return {
      type: 'national',
      teamData,
    };
  }

  // ユースチーム判定（U19, Youth, Junior, Juvenil, Primaveraなどを含む）
  const isYouthTeam = /\b(U\d+|Youth|Junior|Juvenil|Primavera)\b/i.test(teamName);

  return {
    type: isYouthTeam ? 'youth' : 'senior',
    teamData,
  };
}
