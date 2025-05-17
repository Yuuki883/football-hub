import { NextResponse } from 'next/server';
import { getAllLeagues, getLeagueBySlug } from '@/features/leagues/api/league-info';
import { getLeagueTeams } from '@/features/leagues/api/league-teams';
import { getLeagueStandings } from '@/features/leagues/api/league-standings';
import { getLeagueFixtures } from '@/features/leagues/api/league-fixtures';
import { getLeagueStats } from '@/features/leagues/api/league-stats';
import { DEFAULT_SEASON } from '@/config/api';

// APIルートが動的であることを明示
export const dynamic = 'force-dynamic';

/**
 * リーグ情報を取得するAPIエンドポイント
 *
 * クエリパラメータ:
 * - slug: リーグスラグ (例: premier-league)
 * - include: 追加で取得する情報 (teams,standings,fixtures,stats)
 * - season: シーズン (デフォルト: 現在のシーズン)
 * - forceRefresh: キャッシュをバイパスして最新のデータを取得する場合は 'true'
 *
 * レスポンス:
 * - success: true/false
 * - leagues: リーグ情報の配列（slugが指定されない場合）
 * - league: 単一のリーグ情報（slugが指定される場合）
 * - teams: チーム情報（includeに"teams"が含まれる場合）
 * - standings: 順位表（includeに"standings"が含まれる場合）
 * - fixtures: 直近の試合（includeに"fixtures"が含まれる場合）
 * - stats: 統計情報（includeに"stats"が含まれる場合）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const season = searchParams.get('season') || DEFAULT_SEASON;
    const include = searchParams.get('include')?.split(',') || [];
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // スラグが指定されている場合は単一リーグの情報を返す
    if (slug) {
      const league = await getLeagueBySlug(slug);

      if (!league) {
        return NextResponse.json({ success: false, error: 'League not found' }, { status: 404 });
      }

      // レスポンスデータの準備
      const response: any = {
        success: true,
        league: league.league,
        country: league.country,
        seasons: league.seasons,
      };

      // 同時に複数のデータ取得をPromise.allで効率化
      const promises = [];
      const includeMap: Record<string, () => Promise<any>> = {
        teams: () => getLeagueTeams(slug, { season, forceRefresh }),
        standings: () => getLeagueStandings(slug, { season, forceRefresh }),
        fixtures: () =>
          getLeagueFixtures(slug, {
            season,
            limit: 10, // 直近10試合に制限
            forceRefresh,
          }),
        stats: () => getLeagueStats(slug, { season, forceRefresh }),
      };

      // 要求されたデータの取得処理を登録
      for (const item of include) {
        if (includeMap[item]) {
          promises.push({
            key: item,
            promise: includeMap[item](),
          });
        }
      }

      // 並列で全てのデータを取得
      if (promises.length > 0) {
        const results = await Promise.all(
          promises.map((p) =>
            p.promise.catch((error) => {
              console.error(`Error fetching ${p.key} for league ${slug}:`, error);
              return null; // エラーが発生した場合はnullを返して他のデータ取得を継続
            })
          )
        );

        // 結果をレスポンスに追加
        promises.forEach((p, index) => {
          response[p.key] = results[index];
        });
      }

      return NextResponse.json(response);
    }

    // スラグが指定されていない場合は全リーグの基本情報を返す
    const leagues = await getAllLeagues();

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      leagues: leagues.map((data) => ({
        ...data.league,
        country: data.country,
      })),
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leagues',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// キャッシュ設定（12時間）
export const revalidate = 43200;
