import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';

interface MatchDetailPageProps {
  params: {
    fixtureId: string;
  };
}

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const { fixtureId } = params;

  try {
    // 後で実装する: 試合情報に基づくメタデータの生成
    return {
      title: `試合詳細 #${fixtureId}`,
      description: `試合の詳細情報、スコア、ハイライト`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '試合詳細',
    };
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { fixtureId } = params;

  // 後で実装する: 試合データの取得
  // const matchData = await getFixtureById(fixtureId);

  // if (!matchData) {
  //   notFound();
  // }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="p-4 text-center">試合データを読み込み中...</div>}>
          <h1 className="text-2xl font-bold mb-4">試合詳細 #{fixtureId}</h1>
          <p>このページは開発中です。後ほど試合の詳細情報が表示されます。</p>
        </Suspense>
      </div>
    </PageLayout>
  );
}
