import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTeamById } from '@/features/teams/api/team-info';
import { getTeamStandings } from '@/features/teams/api/team-standings';
import StandingsTable from '@/app/leagues/[slug]/components/StandingsTable';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PageLayout from '@/components/layout/PageLayout';

interface TeamStandingsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    season?: string;
  };
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: TeamStandingsPageProps): Promise<Metadata> {
  const { id } = params;

  try {
    const teamData = await getTeamById(id);

    if (!teamData) {
      console.log(`メタデータ生成: チームID ${id} のデータが見つかりません`);
      return {
        title: '順位表 | チームが見つかりません',
      };
    }

    return {
      title: `${teamData.team.name} リーグ順位表 | Football Hub`,
      description: `${teamData.team.name}が所属するリーグの最新順位表、勝ち点、成績など`,
    };
  } catch (error) {
    console.error(`メタデータ生成エラー: チームID ${id}`, error);
    return {
      title: '順位表 | エラーが発生しました',
    };
  }
}

// ISR - 1時間ごとに再検証
export const revalidate = 3600;

export default async function TeamStandingsPage({
  params,
  searchParams,
}: TeamStandingsPageProps) {
  const { id } = params;
  console.log(`順位表ページ: チームID ${id} のデータを取得します`);

  const season = parseInt(searchParams.season || '2024');

  try {
    // チーム情報を取得
    const teamData = await getTeamById(id);

    if (!teamData) {
      console.error(`チームID ${id} のデータが見つかりません`);
      notFound();
    }

    // チームの所属リーグの順位表を取得
    const { standings, leagueId, teamInLeagueData } = await getTeamStandings(
      id,
      season
    );

    if (!standings) {
      console.error(
        `チームID ${id} の順位表データが見つかりません (リーグID: ${
          leagueId || 'unknown'
        })`
      );
      // notFoundではなくエラーメッセージを表示する
      return (
        <PageLayout>
          <div className="mb-6">
            <TeamHeader team={teamData.team} season={season} />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">
              順位表データを取得できませんでした
            </h2>
            <p className="mb-4">
              このチームの順位表データは現在利用できません。
            </p>
          </div>
        </PageLayout>
      );
    }

    return (
      <PageLayout>
        <div className="mb-6">
          <TeamHeader team={teamData.team} season={season} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <Suspense
            fallback={<div className="text-center py-4">読み込み中...</div>}
          >
            <div className="flex items-center gap-3 mb-5">
              {teamInLeagueData?.leagueLogo && (
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={teamInLeagueData.leagueLogo}
                    alt={teamInLeagueData.leagueName || 'リーグロゴ'}
                    fill
                    sizes="32px"
                    className="object-contain"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold">
                {teamInLeagueData?.leagueName || ''}
              </h1>
            </div>
            <StandingsTable
              standings={standings}
              season={season}
              highlightTeamId={id}
            />
          </Suspense>
        </div>
      </PageLayout>
    );
  } catch (error) {
    console.error(
      `チームID ${id} の順位表ページでエラーが発生しました:`,
      error
    );
    notFound();
  }
}
