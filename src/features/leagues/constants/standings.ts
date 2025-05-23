export const UEFA_LEAGUES = ['champions-league', 'europa-league', 'conference-league'] as const;

export const LEGEND_LABELS = {
  KNOCKOUT: '決勝T',
  PLAYOFF: 'プレーオフ',
  EL_RELEGATION: 'EL降格',
  ECL_RELEGATION: 'ECL降格',
  ELIMINATION: '敗退',
} as const;

// 凡例の出現順
export const LEGEND_ORDER = [
  LEGEND_LABELS.KNOCKOUT,
  LEGEND_LABELS.PLAYOFF,
  LEGEND_LABELS.EL_RELEGATION,
  LEGEND_LABELS.ECL_RELEGATION,
  LEGEND_LABELS.ELIMINATION,
  'CL',
  'EL',
  'ECL',
  'CLプレーオフ',
  'ELプレーオフ',
  'ECLプレーオフ',
  'CL予選',
  'EL予選',
  'ECL予選',
  '予選',
  '昇格',
  '降格',
  'PO',
] as const;
