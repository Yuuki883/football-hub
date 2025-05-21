import { getCountryNames } from '@/lib/api-football/country';
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
  const nationalTeamKeywords = ['U17', 'U19', 'U20', 'U21', 'U23', 'Olympic', 'オリンピック'];

  // 国名を含み、かつ代表チームキーワードのいずれかを含む場合のみ代表チームと判定
  for (const country of countryNames) {
    if (teamName.includes(country)) {
      for (const keyword of nationalTeamKeywords) {
        if (teamName.includes(keyword)) {
          `代表チームと判定: ${teamName} (国名: ${country}, キーワード: ${keyword})`;
          return true;
        }
      }

      // 国名が完全一致する場合は代表チーム（例："England", "Brazil"）
      if (teamName === country) {
        `代表チームと判定: ${teamName} (国名完全一致)`;
        return true;
      }
    }
  }

  // 上記の条件に一致しなければ代表チームではない
  return false;
}
