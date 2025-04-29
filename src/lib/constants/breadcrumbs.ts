/**
 * パスセグメントから表示名へのマッピング
 * パンくずリスト、メタデータ、ナビゲーションなどで使用
 */
export const PATH_DISPLAY_MAP: Record<string, string> = {
  '': 'ホーム',
  leagues: 'リーグ',
  standings: '順位表',
  matches: '試合',
  stats: 'スタッツ',
  teams: 'チーム',
  players: '選手',
  news: 'ニュース',
  'premier-league': 'プレミアリーグ',
  'la-liga': 'ラ・リーガ',
  bundesliga: 'ブンデスリーガ',
  'serie-a': 'セリエA',
  'ligue-1': 'リーグ・アン',
  'champions-league': 'チャンピオンズリーグ',
  'europa-league': 'ヨーロッパリーグ',
  'conference-league': 'カンファレンスリーグ',
};
