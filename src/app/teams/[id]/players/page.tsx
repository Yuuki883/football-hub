import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTeamById } from '@/features/teams/api/team-info';
import { getTeamPlayers, groupPlayersByPosition } from '@/features/teams/api/team-players';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PlayersList from '@/features/teams/components/PlayersList';
import PageLayout from '@/components/layout/PageLayout';

interface TeamPlayersPageProps {
  params: {
    id: string;
  };
}

// メタデータを動的に生成
export async function generateMetadata({ params }: TeamPlayersPageProps): Promise<Metadata> {
  const { id } = params;

  try {
    const teamData = await getTeamById(id);

    if (!teamData) {
      return {
        title: 'チームが見つかりません',
      };
    }

    return {
      title: `${teamData.team.name} - 現在の選手一覧`,
      description: `${teamData.team.name}の現在の選手名鑑`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'チーム選手一覧',
    };
  }
}

// 選手一覧を取得して表示するコンポーネント
async function PlayersContent({ teamId }: { teamId: string }) {
  try {
    // 現在のチームスクワッド（選手データ）を取得
    const players = await getTeamPlayers(teamId, true);

    if (players.length === 0) {
      return (
        <div className="p-6 bg-white rounded-lg shadow my-8">
          <p className="text-center text-amber-500 font-bold">選手データが見つかりませんでした</p>
        </div>
      );
    }

    // ポジション別にグループ化
    const playerGroups = groupPlayersByPosition(players);

    return <PlayersList playerGroups={playerGroups} />;
  } catch (error) {
    console.error('選手データ取得エラー:', error);
    return (
      <div className="p-6 bg-white rounded-lg shadow my-8">
        <p className="text-center text-red-500">
          選手データの取得中にエラーが発生しました。しばらくしてから再度お試しください。
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          エラー詳細: {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    );
  }
}

// メインページコンポーネント
export default async function TeamPlayersPage({ params }: TeamPlayersPageProps) {
  const { id } = params;

  // チーム基本情報を取得
  const teamData = await getTeamById(id);

  if (!teamData) {
    notFound();
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <TeamHeader team={teamData.team} />
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-72 rounded-lg"></div>
              ))}
            </div>
          </div>
        }
      >
        <PlayersContent teamId={id} />
      </Suspense>
    </PageLayout>
  );
}
