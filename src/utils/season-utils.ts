/**
 * シーズンユーティリティ
 *
 * サッカーシーズンに関する計算ロジック
 *
 * @module season-utils
 *
 * 主な機能:
 * - 現在のシーズンの動的取得
 * - 利用可能なシーズンリストの生成
 * - シーズンの表示用フォーマット変換
 */

/**
 * シーズンの開始月を8月に設定
 *
 * @constant
 * @default 8
 */
const SEASON_START_MONTH = 8;

/**
 * 現在のシーズンを取得
 *
 * サッカーのシーズンは年をまたぐため、以下のロジックで判定を行う
 * - 8月以降（8-12月）: その年が新シーズンの開始年 → その年を返す
 * - 7月以前（1-7月）: 前年から継続中のシーズン → 前年を返す
 *
 * 例:
 * - 2025年9月 → 2025を返す（2025-2026シーズン）
 * - 2025年3月 → 2024を返す（2024-2025シーズン）
 * - 2025年8月 → 2025を返す（2025-2026シーズン）
 * - 2025年7月 → 2024を返す（2024-2025シーズン）
 *
 * @returns {number} 現在のシーズン（開始年）
 *
 * @example
 * // 2025年9月の場合
 * const season = getCurrentSeason();
 * console.log(season); // 2025（2025-2026シーズン）
 *
 * @example
 * // 2025年5月の場合
 * const season = getCurrentSeason();
 * console.log(season); // 2024（2024-2025シーズン）
 */
export function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth()は0-indexedなので+1

  // シーズン開始月以降なら新シーズン、それ以前は前シーズン
  return month >= SEASON_START_MONTH ? year : year - 1;
}

/**
 * 利用可能なシーズンのリストを生成します
 *
 * 現在のシーズンを基準に、過去のシーズンと（オプションで）将来のシーズンを含む
 * 配列を降順（新しい順）で返します。
 *
 * @param {boolean} [includeFuture=false] - 将来のシーズンを含めるか
 * @param {number} [pastSeasonCount=3] - 過去何シーズン分を含めるか
 * @returns {number[]} シーズンの配列（降順）
 *
 * @example
 * // 現在が2025-2026シーズンの場合
 * const seasons = getAvailableSeasons();
 * console.log(seasons); // [2025, 2024, 2023, 2022]
 *
 * @example
 * // 将来のシーズンも含める場合
 * const seasons = getAvailableSeasons(true, 2);
 * console.log(seasons); // [2026, 2025, 2024, 2023]
 *
 * @example
 * // 過去5シーズン分を取得
 * const seasons = getAvailableSeasons(false, 5);
 * console.log(seasons); // [2025, 2024, 2023, 2022, 2021, 2020]
 */
export function getAvailableSeasons(
  includeFuture: boolean = false,
  pastSeasonCount: number = 3
): number[] {
  const currentSeason = getCurrentSeason();
  const seasons: number[] = [];

  // 将来のシーズンを含める場合（API-Footballが先行してデータを提供している可能性がある）
  if (includeFuture) {
    seasons.push(currentSeason + 1);
  }

  // 現在のシーズンを追加
  seasons.push(currentSeason);

  // 過去のシーズンを追加
  for (let i = 1; i <= pastSeasonCount; i++) {
    seasons.push(currentSeason - i);
  }

  return seasons;
}

/**
 * シーズンを表示用フォーマットに変換します
 *
 * シーズンの開始年を受け取り、「開始年-終了年」の形式で返します。
 * 例: 2025 → "2025-2026"
 *
 * @param {number} season - シーズン（開始年）
 * @returns {string} フォーマット済み文字列（例: "2025-2026"）
 *
 * @throws {Error} seasonが負の数または非数値の場合
 *
 * @example
 * const displayText = formatSeasonDisplay(2025);
 * console.log(displayText); // "2025-2026"
 *
 * @example
 * const displayText = formatSeasonDisplay(2024);
 * console.log(displayText); // "2024-2025"
 */
export function formatSeasonDisplay(season: number): string {
  if (!Number.isInteger(season) || season < 0) {
    throw new Error(`Invalid season value: ${season}. Season must be a positive integer.`);
  }

  return `${season}-${season + 1}`;
}

/**
 * シーズン選択オプションの型定義
 *
 * UIコンポーネント（SeasonSelectorなど）で使用するシーズン選択肢の形式
 */
export interface SeasonOption {
  /** シーズンID（開始年） */
  id: number;
  /** 表示名（例: "2025-2026"） */
  name: string;
}

/**
 * シーズンオブジェクトの配列を生成します
 *
 * UIコンポーネント（SeasonSelectorなど）で使用するための、
 * idとnameを持つオブジェクト配列を返します。
 *
 * @param {boolean} [includeFuture=false] - 将来のシーズンを含めるか
 * @param {number} [pastSeasonCount=3] - 過去何シーズン分を含めるか
 * @returns {SeasonOption[]} シーズンオブジェクトの配列（降順）
 *
 * @example
 * // 現在が2025-2026シーズンの場合
 * const options = generateSeasonOptions();
 * console.log(options);
 * // [
 * //   { id: 2025, name: '2025-2026' },
 * //   { id: 2024, name: '2024-2025' },
 * //   { id: 2023, name: '2023-2024' },
 * //   { id: 2022, name: '2022-2023' }
 * // ]
 *
 * @example
 * // セレクトボックスで使用する場合
 * const options = generateSeasonOptions(false, 5);
 * return (
 *   <select>
 *     {options.map(option => (
 *       <option key={option.id} value={option.id}>
 *         {option.name}
 *       </option>
 *     ))}
 *   </select>
 * );
 */
export function generateSeasonOptions(
  includeFuture: boolean = false,
  pastSeasonCount: number = 3
): SeasonOption[] {
  const seasons = getAvailableSeasons(includeFuture, pastSeasonCount);

  return seasons.map((season) => ({
    id: season,
    name: formatSeasonDisplay(season),
  }));
}

/**
 * 指定されたシーズンが現在のシーズンかどうかを判定します
 *
 * @param {number} season - 判定するシーズン
 * @returns {boolean} 現在のシーズンの場合true
 *
 * @example
 * // 現在が2025-2026シーズンの場合
 * isCurrentSeason(2025); // true
 * isCurrentSeason(2024); // false
 */
export function isCurrentSeason(season: number): boolean {
  return season === getCurrentSeason();
}

/**
 * 指定されたシーズンが過去のシーズンかどうかを判定します
 *
 * @param {number} season - 判定するシーズン
 * @returns {boolean} 過去のシーズンの場合true
 *
 * @example
 * // 現在が2025-2026シーズンの場合
 * isPastSeason(2024); // true
 * isPastSeason(2025); // false
 * isPastSeason(2026); // false
 */
export function isPastSeason(season: number): boolean {
  return season < getCurrentSeason();
}

/**
 * 指定されたシーズンが将来のシーズンかどうかを判定します
 *
 * @param {number} season - 判定するシーズン
 * @returns {boolean} 将来のシーズンの場合true
 *
 * @example
 * // 現在が2025-2026シーズンの場合
 * isFutureSeason(2026); // true
 * isFutureSeason(2025); // false
 * isFutureSeason(2024); // false
 */
export function isFutureSeason(season: number): boolean {
  return season > getCurrentSeason();
}
