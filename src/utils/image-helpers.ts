/**
 * 画像処理に関するヘルパー関数
 *
 * 画像の最適化制御やエラーハンドリングなど、画像表示に関連するユーティリティ関数を提供
 */

/**
 * 最適化を無効化すべき画像かどうかを判定する
 *
 * 外部API画像（API-Football等）、SVG、または内部画像でないURLを判定
 * Vercelの画像最適化を適用すべきでない画像を特定
 *
 * @param src 画像のソースURL
 * @returns 最適化を無効化すべき場合はtrue、それ以外はfalse
 */
export const isApiFootballImage = (src: string): boolean => {
  // null、undefined、空文字列のチェック
  if (!src || src === '') return false;

  return (
    // API-Football関連の画像
    src.includes('api-sports.io') ||
    src.includes('media-api') ||
    // SVGファイル（最適化のメリットが低い）
    src.endsWith('.svg') ||
    // 外部画像（内部画像は '/' から始まる）
    (!src.startsWith('/') && !src.startsWith('data:'))
  );
};

/**
 * 画像読み込みエラー時のフォールバック処理
 *
 * @param event エラーイベント
 * @param fallbackSrc フォールバック用画像パス
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/images/placeholder.png'
): void => {
  const target = event.currentTarget;
  target.src = fallbackSrc;
};

/**
 * 内部画像かどうかを判定
 *
 * @param src 画像のソースURL
 * @returns 内部画像の場合はtrue、それ以外はfalse
 */
export const isInternalImage = (src: string): boolean => {
  if (!src || src === '') return false;
  return src.startsWith('/');
};

/**
 * 最適化サイズ以下の小さな画像かどうかを判定
 *
 * @param width 画像の幅
 * @param height 画像の高さ
 * @param threshold サイズのしきい値（デフォルト: 32px）
 * @returns サイズが小さい場合はtrue、それ以外はfalse
 */
export const isSmallImage = (
  width?: number | string,
  height?: number | string,
  threshold: number = 32
): boolean => {
  const numWidth = typeof width === 'string' ? parseInt(width) : width;
  const numHeight = typeof height === 'string' ? parseInt(height) : height;

  if (!numWidth || !numHeight) return false;
  return numWidth <= threshold && numHeight <= threshold;
};
