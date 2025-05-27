/**
 * 統合データフォーマッター
 *
 * API-Footballからの各種データをアプリケーションで統一された形式に変換し、
 * 試合、選手、チーム、順位表、移籍情報などの一貫したフォーマット機能を提供
 */

import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import { LEAGUE_ID_MAPPING } from '@/config/api';
import { Match, DateRange } from '../types/fixture';
import { FormattedStanding, ApiFootballTeamStanding } from '../types/standing';
import { FormattedPlayerStats } from '../types/player';

// =============================================================================
// 定数とタイプの再エクスポート
// =============================================================================

/** 日本のタイムゾーン定数 */
const TOKYO_TIMEZONE = 'Asia/Tokyo';

/** デフォルトシーズンの再エクスポート */
export { DEFAULT_SEASON } from '@/config/api';

/** 試合ステータスマッピングの再エクスポート */
export { MATCH_STATUS_MAPPING } from '../types/fixture';

/** 型定義の再エクスポート */
export type { Match, DateRange } from '../types/fixture';
export type { FormattedStanding, FormattedPlayerStats } from '../types/type-exports';

// =============================================================================
// 内部ヘルパー関数
// =============================================================================

/**
 * 日付文字列を日本時間に変換
 * @param dateString - ISO形式の日付文字列
 * @returns 日本時間に変換されたDate
 */
function toJapanTime(dateString?: string | null): Date {
  try {
    if (!dateString) {
      return toZonedTime(new Date(), TOKYO_TIMEZONE);
    }
    const date = parseISO(dateString);
    return toZonedTime(date, TOKYO_TIMEZONE);
  } catch (error) {
    console.error('日付変換エラー:', error, { dateString });
    return toZonedTime(new Date(), TOKYO_TIMEZONE);
  }
}

// =============================================================================
// 試合データ変換関数（Match Formatters）
// =============================================================================

/**
 * 単一の試合データを統一形式に変換
 *
 * @param fixture API-Footballから返される試合データ
 * @returns アプリで統一された形式の試合データ
 */
export function formatMatch(fixture: any): Match {
  return {
    id: fixture.fixture.id.toString(),
    utcDate: fixture.fixture.date,
    status: fixture.fixture.status.short,
    homeTeam: {
      id: fixture.teams.home.id.toString(),
      name: fixture.teams.home.name,
      shortName: fixture.teams.home.name,
      crest: fixture.teams.home.logo,
      logo: fixture.teams.home.logo,
    },
    awayTeam: {
      id: fixture.teams.away.id.toString(),
      name: fixture.teams.away.name,
      shortName: fixture.teams.away.name,
      crest: fixture.teams.away.logo,
      logo: fixture.teams.away.logo,
    },
    score: {
      home: fixture.goals.home,
      away: fixture.goals.away,
    },
    competition: {
      id: fixture.league.id.toString(),
      name: fixture.league.name,
      code:
        Object.keys(LEAGUE_ID_MAPPING).find(
          (key) => LEAGUE_ID_MAPPING[key] === fixture.league.id
        ) || fixture.league.id.toString(),
      type: 'LEAGUE',
      emblem: fixture.league.logo,
    },
    venue: fixture.fixture.venue?.name,
    matchday: fixture.league.round,
  };
}

/**
 * 複数の試合データを統一形式に変換
 *
 * @param fixtures API-Footballから返される試合データの配列
 * @returns 変換済みの試合データ配列
 */
export function formatMatches(fixtures: any[]): Match[] {
  return fixtures.map((fixture) => formatMatch(fixture));
}

// =============================================================================
// 日付・時刻フォーマット関数（Date/Time Formatters）
// =============================================================================

/**
 * 試合日付の統合フォーマット関数
 *
 * @param dateString - ISO形式の日付文字列
 * @param options - フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatMatchDate(
  dateString?: string | null,
  options: {
    includeYear?: boolean;
    includeWeekday?: boolean;
    type?: 'display' | 'group';
  } = {}
): string {
  const { includeYear = false, includeWeekday = true, type = 'display' } = options;

  try {
    if (!dateString) {
      return type === 'group' ? '未定' : '日時未定';
    }

    const date = toJapanTime(dateString);

    if (type === 'group') {
      // グループ化のための日付フォーマット（yyyy-MM-dd）
      return format(date, 'yyyy-MM-dd');
    }

    // 相対日付判定
    if (isToday(date)) {
      return '今日';
    } else if (isTomorrow(date)) {
      return '明日';
    } else if (isYesterday(date)) {
      return '昨日';
    }

    // 通常の日付フォーマット
    const formatString = [includeYear ? 'yyyy年' : '', 'M月d日', includeWeekday ? '(E)' : '']
      .filter(Boolean)
      .join('');

    return format(date, formatString, { locale: ja });
  } catch (error) {
    console.error('日付フォーマットエラー:', error, { dateString, options });
    return type === 'group' ? '未定' : '日時未定';
  }
}

/**
 * 試合時刻の統合フォーマット関数
 *
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた時刻文字列 (HH:mm)
 */
export function formatMatchTime(dateString?: string | null): string {
  try {
    if (!dateString) {
      return '--:--';
    }

    const date = toJapanTime(dateString);
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('時刻フォーマットエラー:', error, { dateString });
    return '--:--';
  }
}

/**
 * シンプルな日付フォーマット関数（yyyy/MM/dd形式）
 * @param dateString - 日付文字列
 * @returns フォーマット済み日付
 */
export function formatDate(dateString?: string | null): string {
  try {
    if (!dateString) return '日付なし';

    const date = parseISO(dateString);
    return format(date, 'yyyy/MM/dd');
  } catch (e) {
    return dateString || '日付なし';
  }
}

// =============================================================================
// 順位表データフォーマット関数（Standings Formatters）
// =============================================================================

/**
 * チーム順位データをアプリ内で統一された形式に変換
 *
 * @param standing API-Footballから返されるチーム順位データ
 * @returns 変換後のデータ
 */
export function formatStanding(standing: ApiFootballTeamStanding): FormattedStanding {
  return {
    position: standing.rank,
    team: {
      id: standing.team.id.toString(),
      name: standing.team.name,
      shortName: standing.team.name,
      crest: standing.team.logo,
    },
    stats: {
      played: standing.all.played,
      won: standing.all.win,
      draw: standing.all.draw,
      lost: standing.all.lose,
      points: standing.points,
      goalsFor: standing.all.goals.for,
      goalsAgainst: standing.all.goals.against,
      goalDifference: standing.goalsDiff,
    },
    form: standing.form || undefined,
    description: standing.description,
  };
}

// =============================================================================
// 選手データフォーマット関数（Player Formatters）
// =============================================================================

/**
 * 選手統計データをフォーマット
 *
 * @param player 選手データ（統計情報を含む）
 * @returns フォーマット済みの選手統計
 */
export function formatPlayerStats(player: any): FormattedPlayerStats | null {
  try {
    // 選手の基本情報を取得
    const playerInfo = player.player || player;
    const statistics = player.statistics?.[0] || player;

    const playerId = playerInfo.id?.toString() || statistics.player?.id?.toString() || '0';

    return {
      id: playerId,
      name: playerInfo.name || 'Unknown Player',
      age: playerInfo.age || 0,
      position: statistics.games?.position || 'Unknown',
      nationality: playerInfo.nationality || '',
      photo: playerInfo.photo || '',
      team: statistics.team
        ? {
            id: statistics.team.id?.toString() || '0',
            name: statistics.team.name || 'Unknown Team',
            logo: statistics.team.logo || '',
          }
        : undefined,
      goals: statistics.goals?.total || 0,
      assists: statistics.goals?.assists || 0,
      appearances: statistics.games?.appearences || 0,
      minutes: statistics.games?.minutes || 0,
      rating: statistics.games?.rating || '',
      cards: {
        yellow: statistics.cards?.yellow || 0,
        red: statistics.cards?.red || 0,
      },
    };
  } catch (error) {
    console.error('Error formatting player stats:', error, player);
    return null;
  }
}

/**
 * レーティングの数値を整形する（"7.866666" -> "7.9"）
 *
 * @param rating - APIから取得した生のレーティング値
 * @returns 整形されたレーティング値
 */
export function formatRating(rating?: string): string | undefined {
  if (!rating) return undefined;
  const ratingNum = parseFloat(rating);
  return ratingNum ? ratingNum.toFixed(1) : undefined;
}

// =============================================================================
// 移籍データフォーマット関数（Transfer Formatters）
// =============================================================================

/**
 * 移籍情報の表示名を生成
 *
 * @param transferType - 移籍タイプ（"Free", "Loan", "€8.5M"など）
 * @returns 日本語を含む表示用移籍タイプ
 */
export function formatTransferType(transferType?: string): string {
  if (!transferType) return '不明';

  // 一般的な移籍タイプの日本語表示
  if (transferType.toLowerCase() === 'free') return '無料移籍';
  if (transferType.toLowerCase() === 'loan') return 'レンタル移籍';
  if (transferType.toLowerCase() === 'end of loan') return 'レンタル終了';

  // 金額を含む移籍タイプはそのまま表示
  return transferType;
}

// =============================================================================
// 日付範囲・計算ユーティリティ（Date Range Utilities）
// =============================================================================

/**
 * 日付範囲を計算するユーティリティ関数
 *
 * @param past 過去の試合を含めるか
 * @param future 将来の試合を含めるか
 * @param days 何日分のデータを取得するか（デフォルト90日）
 * @returns 日付範囲 {dateFrom, dateTo}
 */
export function calculateDateRange(
  past: boolean = true,
  future: boolean = true,
  days: number = 90
): DateRange {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  let dateFrom, dateTo;

  if (past && !future) {
    // 過去の試合のみ
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    dateFrom = pastDate.toISOString().split('T')[0];
    dateTo = formattedToday;
  } else if (!past && future) {
    // 将来の試合のみ
    dateFrom = formattedToday;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    dateTo = futureDate.toISOString().split('T')[0];
  } else {
    // 両方（デフォルト）
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    dateFrom = pastDate.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    dateTo = futureDate.toISOString().split('T')[0];
  }

  return { dateFrom, dateTo };
}
