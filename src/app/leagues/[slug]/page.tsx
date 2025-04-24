import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import StandingsTable from './components/StandingsTable';
import MatchesList from './components/MatchesList';
import ScorersRanking from './components/ScorersRanking';
import AssistsRanking from './components/AssistsRanking';
import {
  getLeagueStandings,
  getLeagueMatches,
  getLeagueTopScorers,
  getLeagueTopAssists,
  getLeagueBySlug,
} from '@/lib/services/league-service';

interface LeaguePageProps {
  params: {
    slug: string;
  };
  searchParams: {
    season?: string;
  };
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
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

export default async function LeaguePage({
  params,
  searchParams,
}: LeaguePageProps) {
  const { slug } = params;
  const season = parseInt(searchParams.season || '2024');

  // 並行データ取得
  const [standings, matches, topScorers, topAssists] = await Promise.all([
    getLeagueStandings(slug, season),
    getLeagueMatches(slug, season),
    getLeagueTopScorers(slug, season),
    getLeagueTopAssists(slug, season),
  ]);

  // 最近の試合と今後の試合に分ける
  const now = new Date();
  const recentMatches =
    matches
      ?.filter((match) => new Date(match.fixture.date) < now)
      .sort(
        (a, b) =>
          new Date(b.fixture.date).getTime() -
          new Date(a.fixture.date).getTime()
      )
      .slice(0, 5) || [];

  const upcomingMatches =
    matches
      ?.filter((match) => new Date(match.fixture.date) >= now)
      .sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
      )
      .slice(0, 5) || [];

  return (
    <>
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">順位表</h2>
        <Suspense fallback={<div>読み込み中...</div>}>
          <StandingsTable standings={standings} leagueSlug={slug} />
        </Suspense>
        <div className="mt-4 text-right">
          <Link
            href={`/leagues/${slug}/standings?season=${season}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            全順位表を見る
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
          <div className="mt-4 text-right">
            <Link
              href={`/leagues/${slug}/stats?season=${season}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              全選手スタッツを見る
            </Link>
          </div>
        </div>
        <div>
          <Suspense fallback={<div>読み込み中...</div>}>
            <AssistsRanking players={topAssists} limit={5} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
