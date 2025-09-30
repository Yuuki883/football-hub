import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import StandingsTable from '../../../features/leagues/components/tables/StandingsTable';
import MatchesList from '../../../features/leagues/components/matches/MatchesList';
import ScorersRanking from '../../../features/leagues/components/rankings/ScorersRanking';
import AssistsRanking from '../../../features/leagues/components/rankings/AssistsRanking';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';
import { getLeagueFixtures } from '@/features/leagues/api/league-fixtures';
import { getLeagueTopScorers, getLeagueTopAssists } from '@/features/leagues/api/league-stats';
import { getLeagueStandings } from '@/features/leagues/api/league-standings';
import { Match } from '@/lib/api-football/types/type-exports';
import { getCurrentSeason } from '@/utils/season-utils';

interface LeaguePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    season?: string;
    forceRefresh?: string;
  }>;
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const leagueData = await getLeagueBySlug(slug);

  if (!leagueData) {
    return {
      title: 'リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} | Football Hub`,
    description: `${leagueData.league.name}の最新情報、順位表、試合結果、ゴールランキングなど`,
  };
}

export default async function LeaguePage({ params, searchParams }: LeaguePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // シーズンの取得：URLパラメータが指定されていない場合は現在のシーズンを使用
  const season = parseInt(resolvedSearchParams.season || getCurrentSeason().toString());
  const forceRefresh = resolvedSearchParams.forceRefresh === 'true';
  const currentYear = new Date().getFullYear();

  // UEFA大会かどうかを判定
  const isUefaCompetition = ['champions-league', 'europa-league', 'conference-league'].includes(
    slug
  );

  // 過去のシーズンかどうかを動的に判定
  // 現在のシーズンより前のシーズンは過去シーズンとして扱う
  const isPastSeason = season < getCurrentSeason();

  // 並行データ取得
  const [standings, topScorers, topAssists] = await Promise.all([
    getLeagueStandings(slug, { season, forceRefresh }),
    getLeagueTopScorers(slug, season, forceRefresh),
    getLeagueTopAssists(slug, season, forceRefresh),
  ]);

  // 試合データを別途取得
  const matches = await getLeagueFixtures(slug, { season, forceRefresh });

  // 最近の試合と今後の試合に分ける
  const now = new Date();

  let recentMatches: Match[] = [];
  let upcomingMatches: Match[] = [];

  // UEFA大会の過去シーズンの場合のみ、決勝戦を表示
  if (isUefaCompetition && isPastSeason) {
    if (matches && matches.length > 0) {
      // 試合の日付をもとにソート（最新の試合が先頭に）
      const sortedMatches = [...matches].sort(
        (a: Match, b: Match) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
      );

      // まず「Final」というラウンド名を含む試合を検索
      const finalMatches = sortedMatches.filter((match: Match) =>
        String(match.matchday)?.toLowerCase().includes('final')
      );

      // 見つからない場合は、一番最後の試合を決勝戦とみなす
      if (finalMatches.length === 0 && sortedMatches.length > 0) {
        finalMatches.push(sortedMatches[0]); // 日付でソートしているので最初の要素が最も新しい（最終戦）
      }

      if (finalMatches.length > 0) {
        recentMatches = finalMatches;
      }
    }
  } else {
    // 通常の処理（現行シーズンまたはUEFA以外のリーグ）
    recentMatches =
      matches
        ?.filter((match: Match) => new Date(match.utcDate) < now)
        .sort((a: Match, b: Match) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
        .slice(0, 5) || [];

    upcomingMatches =
      matches
        ?.filter((match: Match) => new Date(match.utcDate) >= now)
        .sort((a: Match, b: Match) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
        .slice(0, 5) || [];
  }

  return (
    <>
      <div className="mb-12">
        <Suspense fallback={<div>読み込み中...</div>}>
          <StandingsTable
            standings={standings}
            leagueSlug={slug}
            season={season}
            isOverview={true}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {isUefaCompetition && isPastSeason ? (
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">決勝戦</h2>
            <Suspense fallback={<div>読み込み中...</div>}>
              <MatchesList matches={recentMatches} />
            </Suspense>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">最近の試合</h2>
              <Suspense fallback={<div>読み込み中...</div>}>
                <MatchesList matches={recentMatches} />
              </Suspense>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">今後の試合</h2>
              <Suspense fallback={<div>読み込み中...</div>}>
                <MatchesList matches={upcomingMatches} />
              </Suspense>
            </div>
          </>
        )}
        <div className="mt-4 text-right md:col-span-2">
          <Link
            href={`/leagues/${slug}/matches?season=${season}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            全試合を見る
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Suspense fallback={<div>読み込み中...</div>}>
            <ScorersRanking players={topScorers} limit={5} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div>読み込み中...</div>}>
            <AssistsRanking players={topAssists} limit={5} />
          </Suspense>
          <div className="mt-4 text-right">
            <Link
              href={`/leagues/${slug}/stats?season=${season}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              全選手スタッツを見る
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
