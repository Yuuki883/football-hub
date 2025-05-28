import { Suspense } from 'react';
import { Metadata } from 'next';
import ScorersRanking from '../../../../features/leagues/components/rankings/ScorersRanking';
import AssistsRanking from '../../../../features/leagues/components/rankings/AssistsRanking';
import { getLeagueTopScorers, getLeagueTopAssists } from '@/features/leagues/api/league-stats';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';

interface StatsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    season?: string;
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
      title: 'スタッツ | リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} スタッツ | Football Hub`,
    description: `${leagueData.league.name}の得点王、アシストランキングなど`,
  };
}

export default async function StatsPage({ params, searchParams }: StatsPageProps) {
  const { slug } = await params;
  const { season: seasonParam } = await searchParams;
  const season = parseInt(seasonParam || '2024');

  // 並行データ取得
  const [topScorers, topAssists] = await Promise.all([
    getLeagueTopScorers(slug, season),
    getLeagueTopAssists(slug, season),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">スタッツ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Suspense fallback={<div>読み込み中...</div>}>
              <ScorersRanking players={topScorers} limit={10} />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<div>読み込み中...</div>}>
              <AssistsRanking players={topAssists} limit={10} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
