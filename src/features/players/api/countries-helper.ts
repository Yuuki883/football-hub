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

  // APIから得られた情報でチーム名が国名と一致するか、または代表チームキーワードを含むかを判定
  return (
    countryNames.some((country) => teamName === country) ||
    nationalTeamKeywords.some((keyword) => teamName.includes(keyword))
  );
}
