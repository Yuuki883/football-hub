/**
 * データ解析ユーティリティ
 *
 * APIから取得した生データを処理するための関数群
 */

/**
 * シーズン配列から開始と終了のシーズンを抽出する
 *
 * @param seasons - シーズン番号の配列
 * @returns 開始と終了のシーズン情報
 */
export function parseSeasons(seasons: string[] | number[]): {
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
