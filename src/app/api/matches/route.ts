import { NextResponse } from 'next/server';
import {
  getLeagueFixtures,
  getAllLeagueFixturesByDate,
  getMatchDatesForLeague,
} from '@/features/leagues/api/league-fixtures';
import { getTeamFixtures } from '@/features/teams/api/team-fixtures';

import { format, parseISO, isBefore, isAfter, isToday } from 'date-fns';
import { DEFAULT_SEASON } from '@/config/api';

// APIルートが動的であることを明示
export const dynamic = 'force-dynamic';

/**
 * 試合情報を取得するAPIエンドポイント
 *
 * クエリパラメータ:
 * - date: 日付（YYYY-MM-DD形式）、デフォルトは当日
 * - league: リーグID または スラグ
 * - team: チームID
 * - season: シーズン、デフォルトは現在のシーズン
 * - datesOnly: 'true'の場合、試合が存在する日付のみを返す
 * - forceRefresh: 'true'の場合、キャッシュを無視して最新データを取得
 *
 * レスポンス:
 * - success: true/false
 * - matches: 試合情報の配列
 * - dates: datesOnlyがtrueの場合、日付の配列
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // パラメータの取得
    const today = new Date().toISOString().split('T')[0];
    const date = url.searchParams.get('date') || today;
    const league = url.searchParams.get('league');
    const team = url.searchParams.get('team');
    const season = url.searchParams.get('season') || DEFAULT_SEASON;
    const datesOnly = url.searchParams.get('datesOnly') === 'true';
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!, 10)
      : undefined;

    // 日付のみのリクエストの場合
    if (datesOnly) {
      // 対象のリーグが指定されている場合
      if (league) {
        const dates = await getMatchDatesForLeague(league, season);
        return NextResponse.json({
          success: true,
          dates,
        });
      }

      // 全リーグの場合は現在は空配列を返す（将来的に実装予定）
      return NextResponse.json(
        {
          success: false,
          error: 'League parameter is required for dates lookup',
        },
        { status: 400 }
      );
    }

    // チームの試合を取得
    if (team) {
      const matches = await getTeamFixtures(team, {
        season,
        forceRefresh,
        limit: limit || 10, // デフォルトは10試合
      });

      return NextResponse.json({
        success: true,
        matches,
      });
    }

    // 特定リーグの特定日付の試合を取得
    if (league) {
      const matches = await getLeagueFixtures(league, {
        season,
        dateFrom: date,
        dateTo: date,
        forceRefresh,
      });

      return NextResponse.json({
        success: true,
        matches,
      });
    }

    // 全リーグの特定日付の試合を取得
    const matches = await getAllLeagueFixturesByDate(date, {
      season,
      forceRefresh,
    });

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error(`Error fetching matches:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// キャッシュ設定（3時間）
export const revalidate = 10800;
