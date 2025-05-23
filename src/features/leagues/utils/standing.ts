import {
  UEFA_LEAGUE_SLUGS,
  LEGEND_LABELS,
  LEGEND_ORDER,
} from '@/features/leagues/constants/standings';
import type { FormattedStanding } from '@/lib/api-football/types/standing';

type Info = { color: string; label: string };

// 各種判定ロジックを小関数に分割
const uefaNew = (position?: number): Info => {
  if (position && position <= 8)
    return { color: 'bg-blue-600', label: LEGEND_LABELS.championsLeague };
  if (position && position <= 24) return { color: 'bg-purple-500', label: LEGEND_LABELS.playoff };
  return { color: 'bg-gray-400', label: 'elimination' };
};

const uefaOld = (position?: number, slug?: string): Info => {
  if (position && position <= 2) return { color: 'bg-blue-600', label: LEGEND_LABELS.knockout };
  if (position === 3) {
    if (slug === 'champions-league')
      return { color: 'bg-orange-500', label: LEGEND_LABELS.elRelegation };
    if (slug === 'europa-league')
      return { color: 'bg-green-500', label: LEGEND_LABELS.eclRelegation };
  }
  return { color: 'bg-gray-400', label: LEGEND_LABELS.elimination };
};

/**
 * 国内リーグの順位情報判定
 * API-Football API のdescriptionフィールドからポジション情報を判定
 * @param desc APIから返されるdescription
 */
const domestic = (desc: string): Info => {
  // 条件判定を明確にするために小文字化
  const d = desc.toLowerCase();

  // APIの実際のdescriptionパターンに基づく判定
  // 1. CL本戦確定 - "Champions League"
  if (d.includes('champions league') && !d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-blue-600', label: 'CL' };
  }

  // 2. CL予選 - "Champions League Qualification"
  if (d.includes('champions league') && d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-blue-400', label: 'CL予選' };
  }

  // 3. CLプレーオフ - "Champions League Qualification Playoff"
  if (d.includes('champions league') && d.includes('qualification') && d.includes('playoff')) {
    return { color: 'bg-blue-300', label: 'CLプレーオフ' };
  }

  // 4. EL本戦確定 - "Europa League"
  if (d.includes('europa league') && !d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-orange-500', label: 'EL' };
  }

  // 5. EL予選 - "Europa League Qualification"
  if (d.includes('europa league') && d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-orange-400', label: 'EL予選' };
  }

  // 6. ELプレーオフ - "Europa League Qualification Playoff"
  if (d.includes('europa league') && d.includes('qualification') && d.includes('playoff')) {
    return { color: 'bg-orange-300', label: 'ELプレーオフ' };
  }

  // 7. ECL本戦確定 - "Europa Conference League"
  if (d.includes('conference league') && !d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-green-500', label: 'ECL' };
  }

  // 8. ECL予選 - "Europa Conference League Qualification"
  if (d.includes('conference league') && d.includes('qualification') && !d.includes('playoff')) {
    return { color: 'bg-green-400', label: 'ECL予選' };
  }

  // 9. ECLプレーオフ - "Europa Conference League Qualification Playoff"
  if (d.includes('conference league') && d.includes('qualification') && d.includes('playoff')) {
    return { color: 'bg-green-300', label: 'ECLプレーオフ' };
  }

  // その他の状態
  if (d.includes('relegation')) {
    return { color: 'bg-red-600', label: '降格' };
  }

  if (d.includes('promotion')) {
    return { color: 'bg-teal-500', label: '昇格' };
  }

  if (d.includes('play-off') && !d.includes('qualification')) {
    return { color: 'bg-purple-500', label: 'PO' };
  }

  // デフォルト
  return { color: 'bg-gray-400', label: '' };
};

/**
 * position 情報を一元取得
 */
export function getPositionInfo(
  standing: FormattedStanding,
  leagueSlug?: string,
  season: number = 2024
): Info {
  const { description, position } = standing;

  if (!description) return { color: 'bg-gray-400', label: '' };

  const isUefa =
    leagueSlug &&
    UEFA_LEAGUE_SLUGS.includes(
      leagueSlug as 'champions-league' | 'europa-league' | 'conference-league'
    );
  if (isUefa) {
    return season >= 2024 ? uefaNew(position) : uefaOld(position, leagueSlug);
  }

  return domestic(description);
}

/**
 * 凡例アイテムを取得（重複なく、順序も保証）
 */
export function getLegendItems(
  standings: FormattedStanding[],
  leagueSlug?: string,
  season: number = 2024
): Info[] {
  const map = new Map<string, Info>();

  // 実際のデータから凡例を生成
  standings.forEach((s) => {
    const info = getPositionInfo(s, leagueSlug, season);
    if (info.label && !map.has(info.label)) map.set(info.label, info);
  });

  // UEFA旧フォーマットでは必要な凡例を大会ごとに追加
  if (
    leagueSlug &&
    UEFA_LEAGUE_SLUGS.includes(
      leagueSlug as 'champions-league' | 'europa-league' | 'conference-league'
    ) &&
    season < 2024
  ) {
    // 決勝トーナメント進出は全大会共通
    if (!map.has(LEGEND_LABELS.knockout)) {
      map.set(LEGEND_LABELS.knockout, {
        color: 'bg-blue-600',
        label: LEGEND_LABELS.knockout,
      });
    }

    // 各大会ごとの降格先を追加
    if (leagueSlug === 'champions-league') {
      // CLの場合はELへの降格のみ
      if (!map.has(LEGEND_LABELS.elRelegation)) {
        map.set(LEGEND_LABELS.elRelegation, {
          color: 'bg-orange-500',
          label: LEGEND_LABELS.elRelegation,
        });
      }
    } else if (leagueSlug === 'europa-league') {
      // ELの場合はECLへの降格のみ
      if (!map.has(LEGEND_LABELS.eclRelegation)) {
        map.set(LEGEND_LABELS.eclRelegation, {
          color: 'bg-green-500',
          label: LEGEND_LABELS.eclRelegation,
        });
      }
    }

    // 敗退は全大会共通
    if (!map.has(LEGEND_LABELS.elimination)) {
      map.set(LEGEND_LABELS.elimination, {
        color: 'bg-gray-400',
        label: LEGEND_LABELS.elimination,
      });
    }
  }

  // 定義順で並び替え（LEGEND_ORDERにあるものを優先し、その後に残りを追加）
  const orderedItems: Info[] = [];
  const processedLabels = new Set<string>();

  // まずLEGEND_ORDERに定義された順序で追加
  LEGEND_ORDER.forEach((lbl) => {
    const value = LEGEND_LABELS[lbl];
    if (map.has(value)) {
      orderedItems.push(map.get(value)!);
      processedLabels.add(value);
    }
  });

  // LEGEND_ORDERにないが実際に存在するラベルを追加
  map.forEach((info, label) => {
    if (!processedLabels.has(label)) {
      orderedItems.push(info);
    }
  });

  return orderedItems;
}
