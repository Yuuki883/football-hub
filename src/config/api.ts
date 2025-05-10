/**
 * API関連の設定を一元管理
 *
 * 環境変数からAPIキーやエンドポイントURLなどの設定を読み込む
 * プロジェクト全体で一貫した設定値を使用するために参照
 */

// API-Football API設定
export const API_FOOTBALL = {
  KEY: process.env.API_FOOTBALL_KEY || '',
  HOST: process.env.API_FOOTBALL_HOST || '',
  BASE_URL:
    process.env.API_FOOTBALL_BASE_URL ||
    `https://${process.env.API_FOOTBALL_HOST}/v3`,
};

// リーグID (API-Football)のマッピング
export const LEAGUE_ID_MAPPING: Record<string, number> = {
  PL: 39, // プレミアリーグ
  PD: 140, // ラ・リーガ
  BL1: 78, // ブンデスリーガ
  SA: 135, // セリエA
  FL1: 61, // リーグ・アン
  CL: 2, // チャンピオンズリーグ
  EL: 3, // ヨーロッパリーグ
  ECL: 848, // カンファレンスリーグ
};

// リーグスラグとIDのマッピング
export const LEAGUE_SLUG_MAPPING: Record<string, number> = {
  // 欧州5大リーグ
  'premier-league': 39,
  laliga: 140,
  'la-liga': 140,
  bundesliga: 78,
  'serie-a': 135,
  'ligue-1': 61,

  // UEFA主要大会
  'champions-league': 2,
  'europa-league': 3,
  'conference-league': 848,
};

// シーズン設定
export const DEFAULT_SEASON = '2024';

// キャッシュTTL（秒）
export const CACHE_TTL = {
  SHORT: 60 * 30, // 30分
  MEDIUM: 60 * 60 * 3, // 3時間
  LONG: 60 * 60 * 24, // 1日
  VERY_LONG: 60 * 60 * 24 * 7, // 1週間
};
