/**
 * ユーザープロフィールページ
 * ログインユーザーのプロフィール情報、お気に入りチーム、お気に入りリーグを表示する
 */
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import FavoriteTeams from '@/features/profile/components/FavoriteTeams';
import FavoriteLeagues from '@/features/profile/components/FavoriteLeagues';

export const metadata: Metadata = {
  title: 'プロフィール | FootballHub',
  description: 'あなたのプロフィール情報とお気に入りを管理します',
};

export default async function ProfilePage() {
  // セッションからユーザー情報を取得
  const session = await getServerSession(authOptions);

  // 未認証ユーザーはログインページにリダイレクト
  if (!session?.user?.email) {
    redirect('/login');
  }

  try {
    // ユーザー情報とお気に入り情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favoriteTeams: {
          include: { team: true },
        },
        favoriteLeagues: {
          include: { league: true },
        },
      },
    });

    if (!user) {
      redirect('/login');
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <ProfileHeader user={user} />

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">お気に入りチーム</h2>
              <FavoriteTeams favoriteTeams={user.favoriteTeams} />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">お気に入りリーグ</h2>
              <FavoriteLeagues favoriteLeagues={user.favoriteLeagues} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // エラー発生時はログに出力
    console.error('Error in profile page:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-700">エラーが発生しました</h2>
          <p className="text-red-600">プロフィール情報の取得中にエラーが発生しました。</p>
        </div>
      </div>
    );
  }
}
