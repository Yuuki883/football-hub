/**
 * 試合詳細ページ
 * 試合の基本情報、統計、ラインナップ、イベントを表示する
 */

import { notFound } from 'next/navigation';
import { getFixture } from '@/features/matches/api/match-service';
import { MatchLayout } from '@/features/matches/components/MatchLayout';
import { Metadata } from 'next';

// ページの再検証間隔（10分）
export const revalidate = 600;

interface MatchPageProps {
  params: Promise<{
    fixtureId: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { fixtureId } = await params;

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

/**
 * 試合詳細ページコンポーネント
 * @param params - ルートパラメータ
 * @param searchParams - クエリパラメータ
 * @returns 試合詳細ページ
 */
export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  try {
    const { fixtureId } = await params;
    const { tab } = await searchParams;

    // 試合基本情報を取得
    const fixture = await getFixture(fixtureId);

    // 試合が存在しない場合は404
    if (!fixture) {
      notFound();
    }

    return <MatchLayout fixture={fixture} initialTab={tab || 'stats'} />;
  } catch (error) {
    // エラーが発生した場合は404
    console.error('Failed to fetch fixture:', error);
    notFound();
  }
}
