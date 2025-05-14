/**
 * 選手詳細ページ
 *
 * 指定された選手ID（playerId）から情報を取得し、プロフィール、今シーズンの成績、移籍履歴を表示
 */
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlayerDetails } from '@/features/players/api/player-details';
import { DEFAULT_SEASON } from '@/config/api';
import PlayerProfileSection from '@/features/players/components/PlayerProfileSection';
import PlayerStatsSection from '@/features/players/components/PlayerStatsSection';
import PlayerTransferHistory from '@/features/players/components/PlayerTransferHistory';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

// ISRの設定（1時間ごとに再検証）
export const revalidate = 3600;

interface PlayerDetailPageProps {
  params: {
    id: string;
  };
}

// 動的メタデータの生成
export async function generateMetadata({ params }: PlayerDetailPageProps): Promise<Metadata> {
  const { id } = params;

  try {
    const playerData = await getPlayerDetails(id, DEFAULT_SEASON);

    if (!playerData) {
      return {
        title: '選手が見つかりません | Football Hub',
      };
    }

    return {
      title: `${playerData.name} | Football Hub`,
      description: `${playerData.name}の選手プロフィール、成績、移籍履歴などの詳細情報`,
    };
  } catch (error) {
    console.error('選手メタデータ取得エラー:', error);
    return {
      title: '選手詳細 | Football Hub',
    };
  }
}

// 選手データを取得して表示するコンポーネント
async function PlayerContent({ playerId }: { playerId: string }) {
  try {
    const playerData = await getPlayerDetails(playerId, DEFAULT_SEASON);

    if (!playerData) {
      notFound();
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 選手プロフィール（左カラム） */}
        <div className="lg:col-span-4">
          <PlayerProfileSection player={playerData} />
        </div>

        {/* 選手成績と移籍履歴（右カラム） */}
        <div className="lg:col-span-8">
          <PlayerStatsSection stats={playerData.stats} />
          <PlayerTransferHistory transfers={playerData.transferHistory} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('選手データ取得エラー:', error);
    return <ErrorMessage message="選手情報の取得中にエラーが発生しました。" />;
  }
}

// メインページコンポーネント
export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <LoadingSpinner
            size="large"
            message="選手情報を読み込んでいます..."
            className="min-h-[60vh]"
          />
        }
      >
        <PlayerContent playerId={id} />
      </Suspense>
    </div>
  );
}
