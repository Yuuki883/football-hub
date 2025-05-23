import type { LegendLabel, LegendOrder } from '../types/standings';

/**
 * UEFAリーグのスラッグ定義
 */
export const UEFA_LEAGUE_SLUGS = [
  'champions-league',
  'europa-league',
  'conference-league',
] as const;

/**
 * 順位表の凡例ラベル定義
 */
export const LEGEND_LABELS: Record<LegendLabel, string> = {
  championsLeague: 'CL',
  europaLeague: 'EL',
  conferenceLeague: 'ECL',
  relegation: '降格',
  promotion: '昇格',
  playoff: 'PO',
  knockout: '決勝T',
  elRelegation: 'EL降格',
  eclRelegation: 'ECL降格',
  elimination: '敗退',
} as const;

/**
 * 凡例の表示順序
 */
export const LEGEND_ORDER: LegendOrder = [
  'championsLeague',
  'europaLeague',
  'conferenceLeague',
  'knockout',
  'playoff',
  'promotion',
  'relegation',
  'elRelegation',
  'eclRelegation',
  'elimination',
] as const;
