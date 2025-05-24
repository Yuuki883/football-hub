/**
 * チーム情報判定ヘルパーモジュール
 *
 * チームの種別判定（代表チーム、クラブチーム）を行う機能
 */
import { getCountryNames } from '@/lib/api-football/utils/country';

/**
 * チームが代表チームかどうかを判定する関数
 *
 * @param teamName チーム名
 * @returns 代表チームならtrue
 */
export async function isNationalTeam(teamName: string): Promise<boolean> {
  if (!teamName) return false;

  // 国名リストの取得
  let countryNames: string[] = [];
  try {
    countryNames = await getCountryNames();
  } catch (error) {
    console.error('国名リスト取得エラー:', error);
  }

  // 代表チームの特徴的な名前パターン
  const nationalTeamKeywords = ['U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'U23'];

  // 国名を含み、かつ代表チームキーワードのいずれかを含む場合のみ代表チームと判定
  for (const country of countryNames) {
    if (teamName.includes(country)) {
      // 国名が完全一致する場合は代表チーム（例："England", "Brazil"）
      if (teamName === country) {
        return true;
      }

      // 代表チームキーワードを含む場合も代表チーム
      for (const keyword of nationalTeamKeywords) {
        if (teamName.includes(keyword)) {
          return true;
        }
      }
    }
  }

  // 上記の条件に一致しなければ代表チームではない
  return false;
}
