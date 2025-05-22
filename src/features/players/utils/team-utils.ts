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

  // ユースチーム判定（U17, U19などを含むが、代表チームと区別）
  // 代表チームのU17などはisNationalTeam=trueで既に判定済み
  const youthKeywords = ['Youth', 'Junior', 'Juvenil', 'Primavera', 'Jong', 'Young'];

  // U数字パターンの判定（複数のパターンをサポート）
  const hasUPattern = /\b(U\d+|U-\d+|Under-\d+)\b/i.test(teamName);

  // Youth, Junior等のキーワードを含む
  const hasYouthKeyword = youthKeywords.some((keyword) =>
    teamName.toLowerCase().includes(keyword.toLowerCase())
  );

  const isYouthTeam = hasUPattern || hasYouthKeyword;

  return {
    type: isYouthTeam ? 'youth' : 'senior',
    teamData,
  };
}
